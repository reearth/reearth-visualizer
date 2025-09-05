package app

import (
	"context"
	"errors"
	"fmt"
	"io"
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

func servSignatureUploadFiles(
	ec *echo.Echo,
	fileGateway gateway.File,
) {

	securityHandler := SecurityHandler(enableDataLoaders)

	ec.GET("/api/signature-url",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			workspaceID := c.FormValue("workspace_id")

			prj, err := CreateTemporaryProject(ctx, usecases, op, workspaceID)
			if err != nil {
				errMsg := fmt.Sprintf("Failed to Create TemporaryProject: %v", err)
				log.Error(errMsg)
				return nil, err
			}

			signedURL, expires, contentType, err := fileGateway.GenerateSignedUploadUrl(ctx, fmt.Sprintf("%s-%s", workspaceID, prj.ID().String()))
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

	ec.GET("/api/import-project",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			result := map[string]any{}
			name := c.FormValue("name")
			base := filepath.Base(name)
			filename := strings.TrimSuffix(base, filepath.Ext(base))
			parts := strings.SplitN(filename, "-", 2)
			if len(parts) != 2 {
				return nil, fmt.Errorf("invalid file name format: %s", filename)
			}

			workspaceID := parts[0]
			projectID := parts[1]
			pid, err := id.ProjectIDFrom(projectID)
			if err != nil {
				errMsg := fmt.Sprintf("fail project id: %v", err)
				UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
				return nil, err
			}

			f, err := fileGateway.ReadImportProjectZip(ctx, name)
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
			log.Infof("[Import] uncompress zip file")

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
