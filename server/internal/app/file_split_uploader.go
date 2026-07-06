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
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	file_ "github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/log"
	"github.com/spf13/afero"
)

type SplitUploadManager struct {
	mu            sync.RWMutex
	activeUploads map[string]*SplitUploadSession
	tempDir       string
	chunkSize     int64
	maxRetries    int
	fileGateway   gateway.File
}

type SplitUploadSession struct {
	FileID      string
	Project     *project.Project
	Chunks      map[int]struct{}
	TotalChunks int
	Received    int
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// hasAllChunks reports whether every chunk index in [0, TotalChunks) has
// been received. A bare len(Chunks) == TotalChunks count is not sufficient:
// it would treat e.g. indices {1,2,3} as complete for TotalChunks==3,
// silently accepting an upload missing chunk 0 (which is the chunk that
// creates the session's Project).
func (s *SplitUploadSession) hasAllChunks() bool {
	if s.TotalChunks <= 0 {
		return false
	}
	for i := 0; i < s.TotalChunks; i++ {
		if _, ok := s.Chunks[i]; !ok {
			return false
		}
	}
	return true
}

func chunkPartPath(tempDir, fileID string, idx int) string {
	return filepath.Join(tempDir, fmt.Sprintf("%s_part_%d", fileID, idx))
}

func servSplitUploadFiles(
	apiPrivate *echo.Group,
	cfg *ServerConfig,
) {
	splitUploadManager := &SplitUploadManager{
		activeUploads: make(map[string]*SplitUploadSession),
		tempDir:       os.TempDir(),
		chunkSize:     16 * 1024 * 1024, // 16MB
		maxRetries:    3,
		fileGateway:   cfg.Gateways.File,
	}

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

func (m *SplitUploadManager) readSessionProjectID(fileID string) *id.ProjectID {
	m.mu.RLock()
	defer m.mu.RUnlock()
	session := m.activeUploads[fileID]
	if session != nil && session.Project != nil {
		return session.Project.ID().Ref()
	}
	return nil
}

func (m *SplitUploadManager) handleChunkedUpload(ctx context.Context, usecases *interfaces.Container, op *usecase.Operator, wsId accountsID.WorkspaceID, fileID string, chunkNum, totalChunks int, file multipart.File) (interface{}, error) {

	var pid *id.ProjectID
	result := map[string]any{}

	pid = m.readSessionProjectID(fileID)
	if pid != nil {
		log.Infof("[Import] Upload chunk ID: %s chunk: %d of %d Project: %s", fileID, chunkNum+1, totalChunks, pid.String())
	} else {
		log.Infof("[Import] Upload chunk ID: %s chunk: %d of %d ", fileID, chunkNum+1, totalChunks)
	}

	_, err := m.SaveChunk(fileID, chunkNum, file)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to SaveChunk: %v", err)
		if pid != nil {
			UpdateImportStatus(ctx, usecases, op, *pid, project.ProjectImportStatusFailed, errMsg, result)
		}
		return nil, echo.NewHTTPError(http.StatusInternalServerError, errMsg)
	}

	var prj *project.Project
	if chunkNum == 0 {
		prj, err = CreateTemporaryProject(ctx, usecases, op, wsId)
		if err != nil {
			errMsg := fmt.Sprintf("Failed to CreateTemporaryProject: %v", err)
			if pid != nil {
				UpdateImportStatus(ctx, usecases, op, *pid, project.ProjectImportStatusFailed, errMsg, result)
			}
			return nil, err
		}
	}

	session, completed, err := m.UpdateSession(fileID, chunkNum, totalChunks, prj)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to UpdateSession: %v", err)
		if pid != nil {
			UpdateImportStatus(ctx, usecases, op, *pid, project.ProjectImportStatusFailed, errMsg, result)
		}
		return nil, echo.NewHTTPError(http.StatusInternalServerError, errMsg)
	}

	currentHost := adapter.CurrentHost(ctx)

	if completed {

		// Import process, this process will take some time
		go func(session *SplitUploadSession) {

			pid := session.Project.ID()
			bgctx := context.Background()

			defer m.CleanupSession(session.FileID)

			assembledPath := filepath.Join(m.tempDir, session.FileID)
			defer safeRemove(assembledPath)

			if err := m.AssembleChunks(session, assembledPath); err != nil {
				errMsg := fmt.Sprintf("failed to assemble chunks: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
				return
			}
			log.Infof("[Import] assemble chunks")

			fs := afero.NewOsFs()
			f, err := fs.Open(assembledPath)
			if err != nil {
				errMsg := fmt.Sprintf("failed to open assembled file: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
				return
			}
			defer closeWithError(f, &err)

			importData, assetsZip, pluginsZip, version, err := file_.UncompressExportZip(currentHost, f)
			if err != nil {
				errMsg := fmt.Sprintf("fail UncompressExportZip: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
				return
			}
			log.Infof("[Import] uncompress zip file")

			ImportProject(
				bgctx,
				usecases,
				op,
				wsId,
				pid,
				importData,
				assetsZip,
				pluginsZip,
				result,
				version,
			)

		}(session)
	}

	return map[string]interface{}{
		"status":     "chunk_received",
		"project_id": session.Project.ID(),
		"file_id":    fileID,
		"chunk_num":  chunkNum,
		"received":   session.Received,
		"total":      session.TotalChunks,
		"completed":  completed,
		"updated_at": session.UpdatedAt,
	}, nil
}

func (m *SplitUploadManager) SaveChunk(fileID string, chunkNum int, src io.Reader) (string, error) {
	data, readErr := io.ReadAll(src)
	if readErr != nil {
		return "", fmt.Errorf("failed to read chunk data: %w", readErr)
	}
	chunkPath := chunkPartPath(m.tempDir, fileID, chunkNum)
	for i := 0; i < m.maxRetries; i++ {
		writeErr := os.WriteFile(chunkPath, data, 0644)
		if writeErr == nil {
			return chunkPath, nil
		} else if i == m.maxRetries-1 {
			return "", fmt.Errorf("failed after %d retries: %w", m.maxRetries, writeErr)
		}
		time.Sleep(time.Second * time.Duration(i+1))
	}
	return "", fmt.Errorf("failed to save chunk")
}

func (m *SplitUploadManager) UpdateSession(fileID string, chunkNum, totalChunks int, prj *project.Project) (*SplitUploadSession, bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	session, exists := m.activeUploads[fileID]
	if !exists {
		session = &SplitUploadSession{
			FileID:      fileID,
			Chunks:      make(map[int]struct{}),
			TotalChunks: totalChunks,
			CreatedAt:   time.Now(),
		}
		m.activeUploads[fileID] = session
	}
	if prj != nil {
		m.activeUploads[fileID].Project = prj
	}

	session.UpdatedAt = time.Now()
	session.Received++

	if _, ok := session.Chunks[chunkNum]; ok {
		return session, false, nil
	}

	session.Chunks[chunkNum] = struct{}{}

	completed := session.hasAllChunks() && session.Project != nil
	return session, completed, nil
}

func (m *SplitUploadManager) AssembleChunks(session *SplitUploadSession, outputPath string) error {
	outFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer closeWithError(outFile, &err)

	for i := 0; i < session.TotalChunks; i++ {
		chunkPath := chunkPartPath(m.tempDir, session.FileID, i)
		if err := appendToFile(outFile, chunkPath); err != nil {
			return fmt.Errorf("failed to append chunk %d: %w", i, err)
		}
	}
	return nil
}

func (m *SplitUploadManager) CleanupSession(fileID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if session, exists := m.activeUploads[fileID]; exists {
		for idx := range session.Chunks {
			if err := os.Remove(chunkPartPath(m.tempDir, fileID, idx)); err != nil {
				log.Printf("Warning: failed to remove chunk: %v", err)
			}
		}
		delete(m.activeUploads, fileID)
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
	m.mu.Lock()
	defer m.mu.Unlock()

	cutoff := time.Now().Add(-24 * time.Hour)
	for fileID, session := range m.activeUploads {
		if session.UpdatedAt.Before(cutoff) {
			for idx := range session.Chunks {
				if err := os.Remove(chunkPartPath(m.tempDir, fileID, idx)); err != nil {
					log.Printf("Warning: failed to remove chunk: %v", err)
				}
			}
			delete(m.activeUploads, fileID)
		}
	}
}

func appendToFile(dst *os.File, srcPath string) error {
	src, err := os.Open(srcPath)
	if err != nil {
		return err
	}
	defer closeWithError(src, &err)

	_, err = io.Copy(dst, src)
	return err
}

func closeWithError(f io.Closer, err *error) {
	if closeErr := f.Close(); closeErr != nil && *err == nil {
		*err = closeErr
	}
}

func safeRemove(path string) {
	if err := os.Remove(path); err != nil {
		log.Printf("Warning: failed to remove file %s: %v", path, err)
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
