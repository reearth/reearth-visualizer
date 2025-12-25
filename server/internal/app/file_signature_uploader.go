package app

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	file_ "github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/log"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type SignedUploadURLResponse struct {
	TargetWorkspace  string `json:"target_workspace"`
	TemporaryProject string `json:"temporary_project"`
	UploadURL        string `json:"upload_url"`
	ExpiresAt        string `json:"expires_at"`
	ContentType      string `json:"content_type"`
}

func servSignatureUploadFiles(
	apiRoot *echo.Group,
	apiPrivateRoute *echo.Group,
	cfg *ServerConfig,
) {

	securityHandler := SecurityHandler(cfg, enableDataLoaders)

	apiPrivateRoute.POST("/signature-url",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			workspaceID, err := accountsID.WorkspaceIDFrom(c.FormValue("workspace_id"))
			if err != nil {
				errMsg := fmt.Sprintf("Invalid workspace id: %v", err)
				return nil, echo.NewHTTPError(http.StatusBadRequest, errMsg)
			}

			tempPrj, err := CreateTemporaryProject(ctx, usecases, op, workspaceID)
			if err != nil {
				errMsg := fmt.Sprintf("Failed to Create CreateTemporaryProject: %v", err)
				log.Error(errMsg)
				return nil, err
			}

			userID := *op.AcOperator.User

			fileName := GenFileName(workspaceID, tempPrj.ID(), userID)

			signedURL, expires, contentType, err := cfg.Gateways.File.GenerateSignedUploadUrl(ctx, fileName)
			if err != nil {
				errMsg := fmt.Sprintf("Failed to Generate SignedUploadUrl: %v", err)
				log.Error(errMsg)
				return nil, err
			}

			expiresAt := time.Now().Add(time.Duration(expires) * time.Minute)

			return SignedUploadURLResponse{
				TargetWorkspace:  workspaceID.String(),
				TemporaryProject: tempPrj.ID().String(),
				UploadURL:        *signedURL,
				ExpiresAt:        expiresAt.Format(time.RFC3339),
				ContentType:      *contentType,
			}, nil
		}),
	)

	// this endpoint is called from cloud function triggered by GCS event
	// so it is not authenticated
	apiRoot.POST("/import-project",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			n, err := ParseNotification(c)
			if err != nil {
				return nil, err
			}

			base, wid, pid, _, err := SplitFilename(n.CloudEventData.Name)
			if err != nil {
				return nil, err
			}

			defer removeGcsZip(ctx, cfg.Gateways.File, base)

			result := map[string]any{}

			f, err := cfg.Gateways.File.ReadImportProjectZip(ctx, base)
			if err != nil {
				errMsg := fmt.Sprintf("fail ReadImportProjectZip: %v", err)
				UpdateImportStatus(ctx, usecases, op, *pid, project.ProjectImportStatusFailed, errMsg, result)
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
			importData, assetsZip, pluginsZip, version, err := file_.UncompressExportZip(currentHost, tmpfile)
			if err != nil {
				errMsg := fmt.Sprintf("fail UncompressExportZip: %v", err)
				UpdateImportStatus(ctx, usecases, op, *pid, project.ProjectImportStatusFailed, errMsg, result)
				return nil, errors.New(errMsg)
			}
			// EXPORT_DATA_VERSION
			ok := ImportProject(
				ctx,
				usecases,
				op,
				*wid,
				*pid,
				importData,
				assetsZip,
				pluginsZip,
				result,
				version,
			)

			if ok {
				return "finish", nil
			}
			return "failure", nil
		}),
	)

	// this endpoint is called from Pub/Sub push subscription triggered by GCS event
	// OIDC token authentication is handled by the push subscription
	apiRoot.POST("/storage-event",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {
			log.Info("[Import] Received storage event from Pub/Sub")

			n, err := ParseNotification(c)
			if err != nil {
				log.Errorf("[Import] Failed to parse notification: %v", err)
				return nil, err
			}

			log.Infof("[Import] Processing file: %s from bucket: %s", n.CloudEventData.Name, n.CloudEventData.Bucket)

			if len(n.CloudEventData.Name) < 7 || n.CloudEventData.Name[:7] != "import/" {
				log.Infof("[Import] Ignoring file not in import folder: %s", n.CloudEventData.Name)
				return map[string]string{"status": "ignored", "reason": "not in import folder"}, nil
			}

			base, wid, pid, _, err := SplitFilename(n.CloudEventData.Name)
			if err != nil {
				log.Errorf("[Import] Failed to parse filename: %v", err)
				return nil, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid filename format: %v", err))
			}

			defer removeGcsZip(ctx, cfg.Gateways.File, base)

			result := map[string]any{}

			f, err := cfg.Gateways.File.ReadImportProjectZip(ctx, base)
			if err != nil {
				errMsg := fmt.Sprintf("fail ReadImportProjectZip: %v", err)
				log.Errorf("[Import] %s", errMsg)
				UpdateImportStatus(ctx, usecases, op, *pid, project.ProjectImportStatusFailed, errMsg, result)
				return nil, echo.NewHTTPError(http.StatusInternalServerError, errMsg)
			}
			defer f.Close()

			tmpfile, err := os.CreateTemp("", "import-*.zip")
			if err != nil {
				errMsg := fmt.Sprintf("failed to create temp file: %v", err)
				log.Errorf("[Import] %s", errMsg)
				return nil, echo.NewHTTPError(http.StatusInternalServerError, errMsg)
			}
			defer os.Remove(tmpfile.Name())
			defer tmpfile.Close()

			if _, err := io.Copy(tmpfile, f); err != nil {
				errMsg := fmt.Sprintf("failed to copy to temp file: %v", err)
				log.Errorf("[Import] %s", errMsg)
				return nil, echo.NewHTTPError(http.StatusInternalServerError, errMsg)
			}

			if _, err := tmpfile.Seek(0, io.SeekStart); err != nil {
				errMsg := fmt.Sprintf("failed to seek: %v", err)
				log.Errorf("[Import] %s", errMsg)
				return nil, echo.NewHTTPError(http.StatusInternalServerError, errMsg)
			}

			currentHost := adapter.CurrentHost(ctx)
			importData, assetsZip, pluginsZip, version, err := file_.UncompressExportZip(currentHost, tmpfile)
			if err != nil {
				errMsg := fmt.Sprintf("fail UncompressExportZip: %v", err)
				log.Errorf("[Import] %s", errMsg)
				UpdateImportStatus(ctx, usecases, op, *pid, project.ProjectImportStatusFailed, errMsg, result)
				return nil, echo.NewHTTPError(http.StatusInternalServerError, errMsg)
			}

			ok := ImportProject(
				ctx,
				usecases,
				op,
				*wid,
				*pid,
				importData,
				assetsZip,
				pluginsZip,
				result,
				version,
			)

			if ok {
				log.Infof("[Import] Successfully imported project: %s", pid.String())
				return map[string]string{"status": "success", "project_id": pid.String()}, nil
			}

			log.Errorf("[Import] Failed to import project: %s", pid.String())
			return nil, echo.NewHTTPError(http.StatusInternalServerError, "import failed")
		}),
	)

}

func removeGcsZip(ctx context.Context, fileGateway gateway.File, name string) {
	log.Infof("[Import] remove file", name)
	if err := fileGateway.RemoveImportProjectZip(ctx, name); err != nil {
		log.Errorf("fail RemoveImportProjectZip: %v", err)
	}
}
