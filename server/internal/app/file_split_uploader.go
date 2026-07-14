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
	"regexp"
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

// maxChunkCount bounds total_chunks well above any legitimate upload (the
// import pipeline already rejects anything over 500MB, which is ~32
// chunks at the client's 16MB chunk size) while still capping how large a
// backing file a single request can make the server allocate.
const maxChunkCount = 128

// maxConcurrentSessions bounds how many upload sessions — each holding one
// open fd plus a tmpfs-backed file until completion or the 24h stale
// cleanup — may exist at once (SCA-03). This is a hard ceiling on top of
// the CanWriteWorkspace gate below: it keeps worst-case fd/tmpfs exposure
// bounded even for a fully-authorized caller that opens many uploads and
// abandons them.
const maxConcurrentSessions = 256

// safeFileIDPattern restricts file_id to a conservative, path-safe charset.
// fileID flows directly into filepath.Join(tempDir, fileID); without this,
// a client could send a path-traversal value (e.g. "../../etc/cron.d/x")
// to write outside the intended temp directory.
var safeFileIDPattern = regexp.MustCompile(`^[A-Za-z0-9_-]{1,128}$`)

// validateChunkRequest rejects a chunk request before fileID or chunkNum
// ever reach the filesystem: an unrestricted fileID can path-traverse out
// of tempDir via filepath.Join, and an unbounded/negative chunkNum can
// force writes at arbitrary offsets in the backing file.
func validateChunkRequest(fileID string, chunkNum, totalChunks int) error {
	if !safeFileIDPattern.MatchString(fileID) {
		return errors.New("invalid file id")
	}
	if totalChunks <= 0 || totalChunks > maxChunkCount {
		return errors.New("invalid total chunks")
	}
	if chunkNum < 0 || chunkNum >= totalChunks {
		return errors.New("invalid chunk number")
	}
	return nil
}

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
	dispatched  bool
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
	// O_TRUNC guards against a stale file left behind at the same path
	// (e.g. from a crashed previous session with a reused fileID): without
	// it, trailing bytes from the old file would survive past the new
	// upload's shorter content and silently corrupt the assembled zip.
	// 0600 keeps uploaded content unreadable to other OS-level users/
	// processes sharing the temp directory.
	f, err := os.OpenFile(filePath, os.O_CREATE|os.O_TRUNC|os.O_RDWR, 0600)
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
// step). It reports whether this call is the one that completes the
// upload: every chunk index in [0, totalChunks) has been written AND the
// project (created from chunk 0) has been set. Both conditions are
// required — a malformed client that never sends chunk 0 can never be
// reported complete.
//
// completed is reported at most once per session (edge-triggered, not
// level-triggered): once an import has been dispatched, later calls —
// e.g. a client retry of the last chunk, or a duplicate concurrent
// request — return false without touching the file again. Without this,
// every retry after completion would re-dispatch a duplicate import job
// racing the first job's cleanup of this same session/file.
func (s *uploadSession) writeChunk(idx int, r io.Reader) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.dispatched {
		return false, nil
	}

	// Cap the write at chunkSize bytes so an oversized chunk can never
	// spill into the next chunk's offset. Any chunk but the last must be
	// exactly chunkSize; a short or oversized chunk is rejected (and not
	// marked received) rather than silently corrupting the assembled file.
	offset := int64(idx) * s.chunkSize
	n, err := io.Copy(io.NewOffsetWriter(s.file, offset), io.LimitReader(r, s.chunkSize))
	if err != nil {
		return false, fmt.Errorf("failed to write chunk %d: %w", idx, err)
	}
	isFinal := idx == s.totalChunks-1
	if n == 0 {
		return false, fmt.Errorf("chunk %d is empty", idx)
	}
	if !isFinal && n != s.chunkSize {
		return false, fmt.Errorf("chunk %d is %d bytes, want exactly %d", idx, n, s.chunkSize)
	}
	var probe [1]byte
	if extra, _ := r.Read(probe[:]); extra > 0 {
		return false, fmt.Errorf("chunk %d exceeds max chunk size (%d bytes)", idx, s.chunkSize)
	}

	s.received[idx] = struct{}{}
	s.updatedAt = time.Now()

	if !s.hasAllChunksLocked() || s.project == nil {
		return false, nil
	}
	s.dispatched = true
	return true, nil
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

			if err := validateChunkRequest(fileID, chunkNum, totalChunks); err != nil {
				return nil, echo.NewHTTPError(http.StatusBadRequest, err.Error())
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

// getOrCreateSession is only ever called for chunk 0 (see handleChunkedUpload):
// creating a session opens an fd and a tmpfs-backed file, so it must never
// happen before the caller's CanWriteWorkspace check, and it must be capped
// so an authorized-but-abusive or buggy client can't exhaust fds/tmpfs by
// starting many uploads it never finishes (SCA-03).
func (m *SplitUploadManager) getOrCreateSession(fileID string, totalChunks int) (*uploadSession, error) {
	m.mgrMu.Lock()
	defer m.mgrMu.Unlock()

	if s, ok := m.sessions[fileID]; ok {
		return s, nil
	}
	if len(m.sessions) >= maxConcurrentSessions {
		return nil, errors.New("too many upload sessions in progress, try again later")
	}
	s, err := newUploadSession(m.tempDir, fileID, totalChunks, m.chunkSize)
	if err != nil {
		return nil, err
	}
	m.sessions[fileID] = s
	return s, nil
}

// atCapacity is a cheap pre-check so a request that's already doomed to
// hit the cap can be rejected before CreateTemporaryProject runs, instead
// of after (which would leave an orphaned temporary project behind).
// getOrCreateSession's own check remains authoritative for the narrow
// race where concurrent chunk-0 requests both pass this pre-check.
func (m *SplitUploadManager) atCapacity() bool {
	m.mgrMu.Lock()
	defer m.mgrMu.Unlock()
	return len(m.sessions) >= maxConcurrentSessions
}

// getSession looks up an existing session without creating one. Only chunk
// 0 may create a session (after CanWriteWorkspace passes); every other
// chunk must reference a session chunk 0 already started, so a client can
// never pin an fd/tmpfs file by sending non-zero chunks for file_ids that
// were never authorized (SCA-03).
func (m *SplitUploadManager) getSession(fileID string) (*uploadSession, bool) {
	m.mgrMu.Lock()
	defer m.mgrMu.Unlock()
	s, ok := m.sessions[fileID]
	return s, ok
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

	var session *uploadSession

	if chunkNum == 0 {
		if s, ok := m.getSession(fileID); ok {
			// A retry of chunk 0 for a session that already exists must
			// reuse it rather than calling CreateTemporaryProject again,
			// which would create an orphaned duplicate temporary project
			// per retry (caught in review).
			session = s
		} else {
			// Reject before creating a project if we're already at the
			// session cap, so a doomed request doesn't still leave behind
			// a temporary project with no session to ever complete it
			// (caught in review). getOrCreateSession below remains the
			// authoritative check for the narrow concurrent-at-the-cap race.
			if m.atCapacity() {
				return nil, echo.NewHTTPError(http.StatusTooManyRequests, "too many upload sessions in progress, try again later")
			}
			// CreateTemporaryProject enforces CanWriteWorkspace before
			// anything else happens, so no fd/tmpfs file is created
			// (getOrCreateSession below) for a workspace the caller
			// doesn't have access to (SCA-03).
			prj, err := CreateTemporaryProject(ctx, usecases, op, wsId)
			if err != nil {
				return nil, err
			}
			s, err := m.getOrCreateSession(fileID, totalChunks)
			if err != nil {
				return nil, echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to start upload session: %v", err))
			}
			s.setProject(prj)
			session = s
		}
	} else {
		// Non-zero chunks may never create a session: only chunk 0, gated
		// by CanWriteWorkspace above, can. A client sending chunk_num > 0
		// for a file_id that never had a chunk 0 gets rejected instead of
		// silently pinning an fd/tmpfs file (SCA-03).
		s, ok := m.getSession(fileID)
		if !ok {
			return nil, echo.NewHTTPError(http.StatusBadRequest, "unknown or expired upload session; restart the upload from chunk 0")
		}
		// total_chunks must match the value the session was created with:
		// otherwise a client could pass an inflated total_chunks to clear
		// validateChunkRequest's bound check, then write a chunk_num far
		// beyond the session's real chunk count (caught in review).
		if totalChunks != s.snapshot().TotalChunks {
			return nil, echo.NewHTTPError(http.StatusBadRequest, "total_chunks does not match this upload session's original value")
		}
		session = s
	}

	if pre := session.snapshot(); pre.ProjectID != nil {
		log.Infof("[Import] Upload chunk ID: %s chunk: %d of %d Project: %s", fileID, chunkNum+1, totalChunks, pre.ProjectID.String())
	} else {
		log.Infof("[Import] Upload chunk ID: %s chunk: %d of %d ", fileID, chunkNum+1, totalChunks)
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
