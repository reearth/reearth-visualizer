package app

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	file_ "github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/log"
)

type SignedUploadURLResponse struct {
	UploadURL   string `json:"upload_url"`
	ExpiresAt   string `json:"expires_at"`
	ContentType string `json:"content_type"`
}

type Notification struct {
	EventType      string `json:"event_type"`
	CloudEventData struct {
		Bucket      string `json:"bucket"`
		Name        string `json:"name"`
		ContentType string `json:"contentType"`
		Size        string `json:"size"`        // 数値なら int64 でもOK
		TimeCreated string `json:"timeCreated"` // RFC3339 なら後で time.Parse 可
	} `json:"cloud_event_data"`
	FileInfo struct {
		Folder   string `json:"folder"`
		Filename string `json:"filename"`
		FullPath string `json:"full_path"`
	} `json:"file_info"`
	Timestamp string `json:"timestamp"`
}

func servSignatureUploadFiles(
	ec *echo.Echo,
	fileGateway gateway.File,
) {

	securityHandler := SecurityHandler(enableDataLoaders)

	ec.POST("/api/signature-url",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			workspaceID := c.FormValue("workspace_id")

			tempPrj, err := CreateTemporaryProject(ctx, usecases, op, workspaceID)
			if err != nil {
				errMsg := fmt.Sprintf("Failed to Create CreateTemporaryProject: %v", err)
				log.Error(errMsg)
				return nil, err
			}

			signedURL, expires, contentType, err := fileGateway.GenerateSignedUploadUrl(ctx, fmt.Sprintf("%s-%s.zip", workspaceID, tempPrj.ID().String()))
			if err != nil {
				errMsg := fmt.Sprintf("Failed to Generate SignedUploadUrl: %v", err)
				log.Error(errMsg)
				return nil, err
			}

			expiresAt := time.Now().Add(time.Duration(expires) * time.Minute)

			return SignedUploadURLResponse{
				UploadURL:   *signedURL,
				ExpiresAt:   expiresAt.Format(time.RFC3339),
				ContentType: *contentType,
			}, nil
		}),
	)

	ec.POST("/api/import-project",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			var n Notification
			if err := c.Bind(&n); err != nil {
				b, _ := io.ReadAll(c.Request().Body)
				return nil, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("invalid JSON: %v; body=%s", err, string(b)))
			}

			fmt.Println("[Import Project] recv notification file_name: ", n.CloudEventData.Name)

			base := filepath.Base(n.CloudEventData.Name)

			defer removeGcsZip(ctx, fileGateway, base)

			filename := strings.TrimSuffix(base, filepath.Ext(base))
			parts := strings.SplitN(filename, "-", 2)
			if len(parts) != 2 {
				return nil, fmt.Errorf("invalid file name format: %s", filename)
			}

			result := map[string]any{}

			workspaceID := parts[0]
			projectID := parts[1]
			pid, err := id.ProjectIDFrom(projectID)
			if err != nil {
				errMsg := fmt.Sprintf("fail project id: %v", err)
				UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
				return nil, err
			}

			f, err := fileGateway.ReadImportProjectZip(ctx, base)
			if err != nil {
				errMsg := fmt.Sprintf("fail ReadImportProjectZip: %v", err)
				UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
				return nil, err
			}
			defer f.Close()

			tmpfile, err := os.CreateTemp("", "import-*.zip")
			if err != nil {
				return nil, fmt.Errorf("failed to create temp file: %w", err)
			}
			defer os.Remove(tmpfile.Name())
			defer tmpfile.Close()

			if _, err := io.Copy(tmpfile, f); err != nil {
				return nil, fmt.Errorf("failed to copy to temp file: %w", err)
			}

			if _, err := tmpfile.Seek(0, io.SeekStart); err != nil {
				return nil, fmt.Errorf("failed to seek: %w", err)
			}

			currentHost := adapter.CurrentHost(ctx)
			importData, assetsZip, pluginsZip, err := file_.UncompressExportZip(currentHost, tmpfile)
			if err != nil {
				errMsg := fmt.Sprintf("fail UncompressExportZip: %v", err)
				UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
				return nil, errors.New(errMsg)
			}

			ok := ImportProject(
				ctx,
				usecases,
				op,
				workspaceID,
				pid,
				importData,
				assetsZip,
				pluginsZip,
				result)

			if ok {
				return "finish", nil
			}
			return "failure", nil
		}),
	)

}

func removeGcsZip(ctx context.Context, fileGateway gateway.File, name string) {
	log.Infof("[Import] remove file", name)
	if err := fileGateway.RemoveImportProjectZip(ctx, name); err != nil {
		log.Errorf("fail RemoveImportProjectZip: %v", err)
	}
}
