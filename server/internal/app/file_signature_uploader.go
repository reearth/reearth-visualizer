package app

import (
	"context"
	"encoding/base64"
	"encoding/json"
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
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/log"
)

type SignedUploadURLResponse struct {
	TargetWorkspace  string `json:"target_workspace"`
	TemporaryProject string `json:"temporary_project"`
	UploadURL        string `json:"upload_url"`
	ExpiresAt        string `json:"expires_at"`
	ContentType      string `json:"content_type"`
}

type Notification struct {
	EventType      string `json:"event_type"`
	CloudEventData struct {
		Bucket      string `json:"bucket"`
		Name        string `json:"name"`
		ContentType string `json:"contentType"`
		Size        string `json:"size"`
		TimeCreated string `json:"timeCreated"`
	} `json:"cloud_event_data"`
	FileInfo struct {
		Folder   string `json:"folder"`
		Filename string `json:"filename"`
		FullPath string `json:"full_path"`
	} `json:"file_info"`
	Timestamp string `json:"timestamp"`
}

// PubSubMessage represents the Pub/Sub push message format
type PubSubMessage struct {
	Message struct {
		Data        string            `json:"data"`
		Attributes  map[string]string `json:"attributes"`
		MessageID   string            `json:"messageId"`
		PublishTime string            `json:"publishTime"`
	} `json:"message"`
	Subscription string `json:"subscription"`
}

// StorageObjectData represents the Cloud Storage notification payload
type StorageObjectData struct {
	Bucket         string `json:"bucket"`
	Name           string `json:"name"`
	ContentType    string `json:"contentType"`
	Size           string `json:"size"`
	TimeCreated    string `json:"timeCreated"`
	Updated        string `json:"updated"`
	Generation     string `json:"generation"`
	MetaGeneration string `json:"metageneration"`
}

func servSignatureUploadFiles(
	apiRoot *echo.Group,
	apiPrivateRoute *echo.Group,
	cfg *ServerConfig,
) {

	securityHandler := SecurityHandler(cfg, enableDataLoaders)

	apiPrivateRoute.POST("/signature-url",
		securityHandler(func(c echo.Context, ctx context.Context, usecases *interfaces.Container, op *usecase.Operator) (interface{}, error) {

			workspaceID, err := accountdomain.WorkspaceIDFrom(c.FormValue("workspace_id"))
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

			var pubsubMsg PubSubMessage
			if err := c.Bind(&pubsubMsg); err != nil {
				log.Errorf("[Import] Failed to parse Pub/Sub message: %v", err)
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Invalid Pub/Sub message format")
			}

			decodedData, err := base64.StdEncoding.DecodeString(pubsubMsg.Message.Data)
			if err != nil {
				log.Errorf("[Import] Failed to decode Pub/Sub message data: %v", err)
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Invalid base64 data")
			}

			var storageData StorageObjectData
			if err := json.Unmarshal(decodedData, &storageData); err != nil {
				log.Errorf("[Import] Failed to parse storage object data: %v", err)
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Invalid storage object data")
			}

			log.Infof("[Import] Processing file: %s from bucket: %s", storageData.Name, storageData.Bucket)

			if len(storageData.Name) < 7 || storageData.Name[:7] != "import/" {
				log.Infof("[Import] Ignoring file not in import folder: %s", storageData.Name)
				return map[string]string{"status": "ignored", "reason": "not in import folder"}, nil
			}

			base, wid, pid, _, err := SplitFilename(storageData.Name)
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
