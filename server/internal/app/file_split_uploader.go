package app

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	file_ "github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/log"
	"github.com/spf13/afero"
)

// importWorkerCount bounds how many uploads can be assembled/imported
// concurrently. Import is I/O and CPU heavy (unzip + several sequential DB
// writes), so this is intentionally small and separate from chunk-upload
// concurrency, which is handled per-request by Echo.
const importWorkerCount = 3

// importJobQueueSize is a generous buffer: completed uploads are rare
// relative to chunk requests, so this should never actually block a
// request goroutine in practice.
const importJobQueueSize = 32

// uploadSession tracks one in-progress chunked upload. All fields are
// unexported and every access goes through a locking method below — no
// code outside this type may read or write a field directly. This is what
// prevents the class of bug that produced REL-02: a goroutine or handler
// touching session state without holding its lock.
type uploadSession struct {
	mu          sync.Mutex
	fileID      string
	filePath    string
	file        *os.File
	chunkSize   int64
	totalChunks int
	received    map[int]struct{}
	project     *project.Project
	updatedAt   time.Time
}

// sessionInfo is an immutable snapshot of the fields callers need after
// interacting with a session. It is the only thing that may leave a
// session's lock scope — the HTTP response and the background import job
// both consume this value type, never the live *uploadSession.
type sessionInfo struct {
	FileID      string
	FilePath    string
	ProjectID   *id.ProjectID
	TotalChunks int
	Received    int
	UpdatedAt   time.Time
}

func newUploadSession(tempDir, fileID string, totalChunks int, chunkSize int64) (*uploadSession, error) {
	filePath := filepath.Join(tempDir, fileID)
	f, err := os.OpenFile(filePath, os.O_CREATE|os.O_RDWR, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to create upload file: %w", err)
	}
	return &uploadSession{
		fileID:      fileID,
		filePath:    filePath,
		file:        f,
		chunkSize:   chunkSize,
		totalChunks: totalChunks,
		received:    make(map[int]struct{}),
		updatedAt:   time.Now(),
	}, nil
}

// writeChunk streams r directly to this chunk's byte offset in the
// session's single backing file (no per-chunk files, no later concatenation
// step). It reports whether the upload is now complete: every chunk index
// in [0, totalChunks) has been written AND the project (created from chunk
// 0) has been set. Both conditions are required — a malformed client that
// never sends chunk 0 can never be reported complete.
func (s *uploadSession) writeChunk(idx int, r io.Reader) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	offset := int64(idx) * s.chunkSize
	if _, err := io.Copy(io.NewOffsetWriter(s.file, offset), r); err != nil {
		return false, fmt.Errorf("failed to write chunk %d: %w", idx, err)
	}
	s.received[idx] = struct{}{}
	s.updatedAt = time.Now()

	return s.hasAllChunksLocked() && s.project != nil, nil
}

func (s *uploadSession) hasAllChunksLocked() bool {
	if s.totalChunks <= 0 {
		return false
	}
	for i := range s.totalChunks {
		if _, ok := s.received[i]; !ok {
			return false
		}
	}
	return true
}

func (s *uploadSession) setProject(p *project.Project) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.project = p
}

func (s *uploadSession) snapshot() sessionInfo {
	s.mu.Lock()
	defer s.mu.Unlock()

	info := sessionInfo{
		FileID:      s.fileID,
		FilePath:    s.filePath,
		TotalChunks: s.totalChunks,
		Received:    len(s.received),
		UpdatedAt:   s.updatedAt,
	}
	if s.project != nil {
		pid := s.project.ID()
		info.ProjectID = &pid
	}
	return info
}

func (s *uploadSession) isStale(cutoff time.Time) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.updatedAt.Before(cutoff)
}

func (s *uploadSession) close() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.file.Close(); err != nil {
		log.Printf("Warning: failed to close upload file: %v", err)
	}
	if err := os.Remove(s.filePath); err != nil && !os.IsNotExist(err) {
		log.Printf("Warning: failed to remove upload file: %v", err)
	}
}

// importJob is the handoff between a completed upload and the background
// import pipeline. It carries only plain values and pointers that are safe
// to use unsynchronized (the project/usecases/operator are not mutated by
// this package), never a live *uploadSession.
type importJob struct {
	usecases    *interfaces.Container
	op          *usecase.Operator
	wsId        accountsID.WorkspaceID
	fileID      string
	filePath    string
	projectID   id.ProjectID
	currentHost string
}

// SplitUploadManager owns in-progress upload sessions and a small worker
// pool that assembles+imports completed ones. mgrMu guards ONLY the
// sessions map itself; it is never used to guard a session's fields, so
// there is no seam left for code to accidentally read/write session state
// without going through uploadSession's own lock.
type SplitUploadManager struct {
	mgrMu     sync.Mutex
	sessions  map[string]*uploadSession
	tempDir   string
	chunkSize int64
	jobs      chan importJob
}

func newSplitUploadManager(tempDir string, chunkSize int64) *SplitUploadManager {
	m := &SplitUploadManager{
		sessions:  make(map[string]*uploadSession),
		tempDir:   tempDir,
		chunkSize: chunkSize,
		jobs:      make(chan importJob, importJobQueueSize),
	}
	for range importWorkerCount {
		go m.runWorker()
	}
	return m
}

func servSplitUploadFiles(
	apiPrivate *echo.Group,
	cfg *ServerConfig,
) {
	splitUploadManager := newSplitUploadManager(os.TempDir(), 16*1024*1024) // 16MB

	splitUploadManager.StartCleanupRoutine(1 * time.Hour)

	securityHandler := SecurityHandler(cfg, enableDataLoaders)

	apiPrivate.POST("/split-import",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			if err := c.Request().ParseMultipartForm(splitUploadManager.chunkSize); err != nil {
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Failed to parse multipart form")
			}

			workspaceID, err := accountsID.WorkspaceIDFrom(c.FormValue("workspace_id"))
			if err != nil {
				errMsg := fmt.Sprintf("Invalid workspace id: %v", err)
				return nil, echo.NewHTTPError(http.StatusBadRequest, errMsg)
			}

			fileID := c.FormValue("file_id")

			chunkNum, err := strconv.Atoi(c.FormValue("chunk_num"))
			if err != nil {
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Invalid chunk number")
			}

			totalChunks, err := strconv.Atoi(c.FormValue("total_chunks"))
			if err != nil {
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Invalid total chunks")
			}

			f, _, err := c.Request().FormFile("file")
			if err != nil {
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Failed to get file chunk")
			}
			defer func() {
				if cerr := f.Close(); cerr != nil && err == nil {
					err = cerr
				}
			}()

			return splitUploadManager.handleChunkedUpload(ctx, usecases, op, workspaceID, fileID, chunkNum, totalChunks, f)
		}),
	)

}

func (m *SplitUploadManager) getOrCreateSession(fileID string, totalChunks int) (*uploadSession, error) {
	m.mgrMu.Lock()
	defer m.mgrMu.Unlock()

	if s, ok := m.sessions[fileID]; ok {
		return s, nil
	}
	s, err := newUploadSession(m.tempDir, fileID, totalChunks, m.chunkSize)
	if err != nil {
		return nil, err
	}
	m.sessions[fileID] = s
	return s, nil
}

// dispatchImport hands a completed upload off to the worker pool. This is
// the one seam meant to change when the import pipeline moves to a
// durable, MongoDB-backed job queue (see REL-04): only this method needs
// to be swapped to enqueue a persisted job instead of an in-process
// channel send — nothing in the session/chunking code above needs to move.
func (m *SplitUploadManager) dispatchImport(job importJob) {
	m.jobs <- job
}

func (m *SplitUploadManager) runWorker() {
	for job := range m.jobs {
		m.runImportJob(job)
	}
}

// runImportJob assembles (already done — the session's file is written
// in place, chunk by chunk) and imports one completed upload. It recovers
// from any panic in the pipeline so a single bad upload can only fail that
// one import, never take down the process — this is the general fix for
// the class of bug behind REL-01, not just its specific trigger.
func (m *SplitUploadManager) runImportJob(job importJob) {
	bgctx := context.Background()
	result := map[string]any{}

	defer func() {
		if r := recover(); r != nil {
			errMsg := fmt.Sprintf("panic during import: %v", r)
			log.Errorf("[Import] %s (file %s)", errMsg, job.fileID)
			UpdateImportStatus(bgctx, job.usecases, job.op, job.projectID, project.ProjectImportStatusFailed, errMsg, result)
		}
	}()
	defer m.cleanupSession(job.fileID)

	fs := afero.NewOsFs()
	f, err := fs.Open(job.filePath)
	if err != nil {
		errMsg := fmt.Sprintf("failed to open assembled file: %v", err)
		UpdateImportStatus(bgctx, job.usecases, job.op, job.projectID, project.ProjectImportStatusFailed, errMsg, result)
		return
	}
	defer closeWithError(f, &err)

	importData, assetsZip, pluginsZip, version, err := file_.UncompressExportZip(job.currentHost, f)
	if err != nil {
		errMsg := fmt.Sprintf("fail UncompressExportZip: %v", err)
		UpdateImportStatus(bgctx, job.usecases, job.op, job.projectID, project.ProjectImportStatusFailed, errMsg, result)
		return
	}
	log.Infof("[Import] uncompress zip file")

	ImportProject(
		bgctx,
		job.usecases,
		job.op,
		job.wsId,
		job.projectID,
		importData,
		assetsZip,
		pluginsZip,
		result,
		version,
	)
}

func (m *SplitUploadManager) handleChunkedUpload(ctx context.Context, usecases *interfaces.Container, op *usecase.Operator, wsId accountsID.WorkspaceID, fileID string, chunkNum, totalChunks int, file multipart.File) (interface{}, error) {

	session, err := m.getOrCreateSession(fileID, totalChunks)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to start upload session: %v", err))
	}

	if pre := session.snapshot(); pre.ProjectID != nil {
		log.Infof("[Import] Upload chunk ID: %s chunk: %d of %d Project: %s", fileID, chunkNum+1, totalChunks, pre.ProjectID.String())
	} else {
		log.Infof("[Import] Upload chunk ID: %s chunk: %d of %d ", fileID, chunkNum+1, totalChunks)
	}

	if chunkNum == 0 {
		prj, err := CreateTemporaryProject(ctx, usecases, op, wsId)
		if err != nil {
			return nil, err
		}
		session.setProject(prj)
	}

	completed, err := session.writeChunk(chunkNum, file)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to write chunk: %v", err)
		if pid := session.snapshot().ProjectID; pid != nil {
			UpdateImportStatus(ctx, usecases, op, *pid, project.ProjectImportStatusFailed, errMsg, map[string]any{})
		}
		return nil, echo.NewHTTPError(http.StatusInternalServerError, errMsg)
	}

	snap := session.snapshot()

	if completed {
		// snap.ProjectID is guaranteed non-nil here: writeChunk only
		// reports completed once a project has been set (chunk 0 arrived).
		m.dispatchImport(importJob{
			usecases:    usecases,
			op:          op,
			wsId:        wsId,
			fileID:      snap.FileID,
			filePath:    snap.FilePath,
			projectID:   *snap.ProjectID,
			currentHost: adapter.CurrentHost(ctx),
		})
	}

	resp := map[string]interface{}{
		"status":     "chunk_received",
		"file_id":    fileID,
		"chunk_num":  chunkNum,
		"received":   snap.Received,
		"total":      snap.TotalChunks,
		"completed":  completed,
		"updated_at": snap.UpdatedAt,
	}
	if snap.ProjectID != nil {
		resp["project_id"] = snap.ProjectID.String()
	}
	return resp, nil
}

func (m *SplitUploadManager) cleanupSession(fileID string) {
	m.mgrMu.Lock()
	s, ok := m.sessions[fileID]
	if ok {
		delete(m.sessions, fileID)
	}
	m.mgrMu.Unlock()

	if ok {
		s.close()
	}
}

func (m *SplitUploadManager) StartCleanupRoutine(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			m.cleanupStaleSessions()
		}
	}()
}

func (m *SplitUploadManager) cleanupStaleSessions() {
	cutoff := time.Now().Add(-24 * time.Hour)

	m.mgrMu.Lock()
	var stale []*uploadSession
	for fileID, s := range m.sessions {
		if s.isStale(cutoff) {
			stale = append(stale, s)
			delete(m.sessions, fileID)
		}
	}
	m.mgrMu.Unlock()

	for _, s := range stale {
		s.close()
	}
}

func closeWithError(f io.Closer, err *error) {
	if closeErr := f.Close(); closeErr != nil && *err == nil {
		*err = closeErr
	}
}

func replaceOldSceneID(data *[]byte, newScene *scene.Scene) (string, error) {
	var d map[string]any
	if err := json.Unmarshal(*data, &d); err != nil {
		return "", err
	}
	if s, ok := d["scene"].(map[string]any); ok {
		if oldSceneID, ok := s["id"].(string); ok {

			// Replace new scene id
			*data = bytes.Replace(*data, []byte(oldSceneID), []byte(newScene.ID().String()), -1)
			return oldSceneID, nil
		}
	}
	return "", errors.New("scene id not found")
}
