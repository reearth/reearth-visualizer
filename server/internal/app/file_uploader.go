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
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	file_ "github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/status"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
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
	ProjectID   string
	Chunks      []string
	TotalChunks int
	Received    int
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func serveUploadFiles(
	ec *echo.Echo,
	r gateway.File,
) {
	uploadManager := &UploadManager{
		activeUploads: make(map[string]*UploadSession),
		tempDir:       os.TempDir(),
		chunkSize:     16 * 1024 * 1024, // 16MB
		maxRetries:    3,
		fileGateway:   r,
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

func CreateProcessingProject(ctx context.Context, usecases *interfaces.Container, op *usecase.Operator, teamId string) (*project.Project, error) {

	visibility := "private"
	coreSupport := true
	unknown := "It's importing now..."
	workspaceID, err := accountdomain.WorkspaceIDFrom(teamId)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "Invalid team id")
	}

	prj, err := usecases.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  workspaceID,
		Visualizer:   visualizer.VisualizerCesium,
		Name:         &unknown,
		Description:  &unknown,
		CoreSupport:  &coreSupport,
		Visibility:   &visibility,
		ImportStatus: status.ProjectImportStatusProcessing, // PROCESSING
	}, op)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "Failed to create project")
	}

	return prj, nil

}

func UpdateImportStatus(ctx context.Context, usecases *interfaces.Container, op *usecase.Operator, pid id.ProjectID, status status.ProjectImportStatus) {
	_, err := usecases.Project.UpdateImportStatus(ctx, pid, status, op)
	if err != nil {
		log.Printf("failed to update import status: %v", err)
	}
}

func (m *UploadManager) handleChunkedUpload(ctx context.Context, usecases *interfaces.Container, op *usecase.Operator, teamId, fileID string, chunkNum, totalChunks int, file multipart.File) (interface{}, error) {

	// chunkPath, err := m.SaveChunk(fileID, chunkNum, file)
	_, err := m.SaveChunk(fileID, chunkNum, file)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Failed to save chunk")
	}

	var prj *project.Project
	if chunkNum == 0 {
		prj, err = CreateProcessingProject(ctx, usecases, op, teamId)
		if err != nil {
			return nil, err
		}
	}

	session, completed, err := m.UpdateSession(fileID, chunkNum, totalChunks, prj)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Failed to update upload session")
	}

	if completed {
		// Import process, this process will take some time
		go func(session *UploadSession) {

			pid, err := id.ProjectIDFrom(session.ProjectID)
			if err != nil {
				log.Printf("Invalid project id: %v", err)
				return
			}

			bgctx := context.Background()

			assembledPath := filepath.Join(m.tempDir, session.FileID)
			defer safeRemove(assembledPath)

			if err := m.AssembleChunks(session, assembledPath); err != nil {
				log.Printf("failed to assemble chunks: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			fs := afero.NewOsFs()
			f, err := fs.Open(assembledPath)
			if err != nil {
				log.Printf("failed to open assembled file: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}
			defer closeWithError(f, &err)

			importData, assetsZip, pluginsZip, err := file_.UncompressExportZip(adapter.CurrentHost(bgctx), f)
			if err != nil {
				log.Printf("fail UncompressExportZip: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			newProject, err := usecases.Project.ImportProjectData(bgctx, teamId, &session.ProjectID, importData, op)
			if err != nil {
				log.Printf("fail Import ProjectData: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			importData, err = usecases.Asset.ImportAssetFiles(bgctx, assetsZip, importData, newProject, op)
			if err != nil {
				log.Printf("fail Import AssetFiles: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			newScene, err := usecases.Scene.Create(bgctx, newProject.ID(), false, op)
			if err != nil {
				log.Printf("fail Create Scene: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			oldSceneID, err := replaceOldSceneID(importData, newScene)
			if err != nil {
				log.Printf("fail Get OldSceneID: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			_, _, err = usecases.Plugin.ImportPlugins(bgctx, pluginsZip, oldSceneID, newScene, importData)
			if err != nil {
				log.Printf("fail ImportPlugins: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			newScene, err = usecases.Scene.ImportScene(bgctx, newScene, importData)
			if err != nil {
				log.Printf("fail sceneJSON ImportScene: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			_, err = usecases.Style.ImportStyles(bgctx, newScene.ID(), importData)
			if err != nil {
				log.Printf("fail sceneJSON ImportStyles: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			_, err = usecases.NLSLayer.ImportNLSLayers(bgctx, newScene.ID(), importData)
			if err != nil {
				log.Printf("fail sceneJSON ImportNLSLayers: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			_, err = usecases.StoryTelling.ImportStory(bgctx, newScene.ID(), importData)
			if err != nil {
				log.Printf("fail sceneJSON ImportStory: %v", err)
				UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusFailed)
				return
			}

			m.CleanupSession(session.FileID)
			UpdateImportStatus(bgctx, usecases, op, pid, status.ProjectImportStatusSuccess) // SUCCESS
			log.Printf("Upload completed: %s (%d chunks)", session.FileID, session.TotalChunks)

		}(session)
	}

	return map[string]interface{}{
		"status":     "chunk_received",
		"project_id": session.ProjectID,
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

func (m *UploadManager) UpdateSession(fileID string, chunkNum, totalChunks int, prj *project.Project) (*UploadSession, bool, error) {
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
	if prj != nil {
		m.activeUploads[fileID].ProjectID = prj.ID().String()
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

	sort.Slice(session.Chunks, func(i, j int) bool {
		getChunkNumber := func(s string) int {
			parts := strings.Split(s, "_part_")
			if len(parts) != 2 {
				log.Printf("warning: unexpected chunk name format: %s", s)
				return 0
			}
			n, err := strconv.Atoi(parts[1])
			if err != nil {
				log.Printf("warning: failed to parse chunk number from %s: %v", s, err)
				return 0
			}
			return n
		}

		return getChunkNumber(session.Chunks[i]) < getChunkNumber(session.Chunks[j])
	})

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
