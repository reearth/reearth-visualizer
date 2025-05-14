package app

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	file_ "github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/spf13/afero"
)

type UploadManager struct {
	mu            sync.RWMutex
	activeUploads map[string]*UploadSession
	tempDir       string
	chunkSize     int64
	maxRetries    int
	fileGateway   gateway.File
}

type UploadSession struct {
	FileID      string
	Chunks      []string
	TotalChunks int
	Received    int
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func serveUploadFiles(
	ec *echo.Echo,
	repo gateway.File,
) {
	uploadManager := &UploadManager{
		activeUploads: make(map[string]*UploadSession),
		tempDir:       os.TempDir(),
		chunkSize:     16 * 1024 * 1024, // 16MB
		maxRetries:    3,
		fileGateway:   repo,
	}

	uploadManager.StartCleanupRoutine(1 * time.Hour)

	securityHandler := func(handler func(echo.Context, context.Context, *interfaces.Container, *usecase.Operator) (interface{}, error)) echo.HandlerFunc {
		return func(c echo.Context) error {

			req := c.Request()
			ctx := req.Context()

			usecases := adapter.Usecases(ctx)
			ctx = gql.AttachUsecases(ctx, usecases, enableDataLoaders)
			c.SetRequest(req.WithContext(ctx))

			op := adapter.Operator(ctx)

			res, err := handler(c, ctx, usecases, op)
			if err != nil {
				fmt.Printf("upload handler err: %s\n", err.Error())
				return err
			}
			return c.JSON(http.StatusOK, res)
		}
	}

	ec.POST("/api/split-import",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			if err := c.Request().ParseMultipartForm(uploadManager.chunkSize); err != nil {
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Failed to parse multipart form")
			}

			teamID := c.FormValue("team_id")

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

			return uploadManager.handleChunkedUpload(ctx, usecases, op, teamID, fileID, chunkNum, totalChunks, f)
		}),
	)

}

func (m *UploadManager) handleChunkedUpload(ctx context.Context, usecases *interfaces.Container, op *usecase.Operator, teamId, fileID string, chunkNum, totalChunks int, file multipart.File) (interface{}, error) {

	// chunkPath, err := m.SaveChunk(fileID, chunkNum, file)
	_, err := m.SaveChunk(fileID, chunkNum, file)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Failed to save chunk")
	}

	session, completed, err := m.UpdateSession(fileID, chunkNum, totalChunks)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Failed to update upload session")
	}

	if completed {
		// go func() {

		assembledPath := filepath.Join(m.tempDir, session.FileID)
		if err := m.AssembleChunks(session, assembledPath); err != nil {
			return nil, fmt.Errorf("failed to assemble chunks: %w", err)
		}
		defer safeRemove(assembledPath)

		fs := afero.NewOsFs()
		f, err := fs.Open(assembledPath)
		if err != nil {
			return nil, fmt.Errorf("failed to open assembled file: %w", err)
		}
		defer closeWithError(f, &err)

		importData, assetsZip, pluginsZip, err := file_.UncompressExportZip(adapter.CurrentHost(ctx), f)
		if err != nil {
			return nil, errors.New("Fail UncompressExportZip :" + err.Error())
		}

		// First, create the project. A project associated with the asset is required.
		newProject, err := usecases.Project.ImportProjectData(ctx, teamId, importData, op)
		if err != nil {
			return nil, errors.New("Fail Import ProjectData :" + err.Error())
		}

		importData, err = usecases.Asset.ImportAssetFiles(ctx, assetsZip, importData, newProject)
		if err != nil {
			return nil, errors.New("Fail Import AssetFiles :" + err.Error())
		}

		newScene, err := usecases.Scene.Create(ctx, newProject.ID(), false, op)
		if err != nil {
			return nil, errors.New("Fail Create Scene :" + err.Error())
		}

		oldSceneID, err := replaceOldSceneID(importData, newScene)
		if err != nil {
			return nil, errors.New("Fail Get OldSceneID :" + err.Error())
		}

		_, _, err = usecases.Plugin.ImportPlugins(ctx, pluginsZip, oldSceneID, newScene, importData)
		if err != nil {
			return nil, errors.New("Fail ImportPlugins :" + err.Error())
		}

		//　The following is the saving of sceneJSON. -----------------------

		// Scene data save
		newScene, err = usecases.Scene.ImportScene(ctx, newScene, importData)
		if err != nil {
			return nil, errors.New("Fail sceneJSON ImportScene :" + err.Error())
		}

		// Styles data save
		_, err = usecases.Style.ImportStyles(ctx, newScene.ID(), importData)
		if err != nil {
			return nil, errors.New("Fail sceneJSON ImportStyles :" + err.Error())
		}

		// NLSLayers data save
		_, err = usecases.NLSLayer.ImportNLSLayers(ctx, newScene.ID(), importData)
		if err != nil {
			return nil, errors.New("Fail sceneJSON ImportNLSLayers :" + err.Error())
		}

		// Story data save
		_, err = usecases.StoryTelling.ImportStory(ctx, newScene.ID(), importData)
		if err != nil {
			return nil, errors.New("Fail sceneJSON ImportStory :" + err.Error())
		}

		m.CleanupSession(session.FileID)

		log.Printf("Upload completed: %s (%d chunks)", session.FileID, session.TotalChunks)
		// }()
	}

	return map[string]interface{}{
		"status":     "chunk_received",
		"file_id":    fileID,
		"chunk_num":  chunkNum,
		"received":   session.Received,
		"total":      session.TotalChunks,
		"completed":  completed,
		"updated_at": session.UpdatedAt,
	}, nil
}

func (m *UploadManager) SaveChunk(fileID string, chunkNum int, src io.Reader) (string, error) {
	data, readErr := io.ReadAll(src)
	if readErr != nil {
		return "", fmt.Errorf("failed to read chunk data: %w", readErr)
	}
	chunkPath := filepath.Join(m.tempDir, fmt.Sprintf("%s_part_%d", fileID, chunkNum))
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

func (m *UploadManager) UpdateSession(fileID string, chunkNum, totalChunks int) (*UploadSession, bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	session, exists := m.activeUploads[fileID]
	if !exists {
		session = &UploadSession{
			FileID:      fileID,
			TotalChunks: totalChunks,
			CreatedAt:   time.Now(),
		}
		m.activeUploads[fileID] = session
	}

	session.UpdatedAt = time.Now()
	session.Received++

	for _, chunk := range session.Chunks {
		if chunk == fmt.Sprintf("%s_part_%d", fileID, chunkNum) {
			return session, false, nil
		}
	}

	session.Chunks = append(session.Chunks, fmt.Sprintf("%s_part_%d", fileID, chunkNum))

	completed := session.TotalChunks > 0 && len(session.Chunks) >= session.TotalChunks
	return session, completed, nil
}

func (m *UploadManager) AssembleChunks(session *UploadSession, outputPath string) error {
	outFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer closeWithError(outFile, &err)

	for _, chunk := range session.Chunks {
		chunkPath := filepath.Join(m.tempDir, chunk)
		if err := appendToFile(outFile, chunkPath); err != nil {
			return fmt.Errorf("failed to append chunk %s: %w", chunk, err)
		}
	}

	return nil
}

func (m *UploadManager) CleanupSession(fileID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if session, exists := m.activeUploads[fileID]; exists {
		for _, chunk := range session.Chunks {
			if err := os.Remove(filepath.Join(m.tempDir, chunk)); err != nil {
				log.Printf("Warning: failed to remove chunk: %v", err)
			}
		}
		delete(m.activeUploads, fileID)
	}
}

func (m *UploadManager) StartCleanupRoutine(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			m.cleanupStaleSessions()
		}
	}()
}

func (m *UploadManager) cleanupStaleSessions() {
	m.mu.Lock()
	defer m.mu.Unlock()

	cutoff := time.Now().Add(-24 * time.Hour)
	for fileID, session := range m.activeUploads {
		if session.UpdatedAt.Before(cutoff) {
			for _, chunk := range session.Chunks {
				if err := os.Remove(filepath.Join(m.tempDir, chunk)); err != nil {
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
