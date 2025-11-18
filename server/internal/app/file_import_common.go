package app

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/log"
)

// CloudEventData represents the data inside a notification
type CloudEventData struct {
	Bucket      string `json:"bucket"`
	Name        string `json:"name"`
	ContentType string `json:"contentType"`
	Size        string `json:"size"`
	TimeCreated string `json:"timeCreated"`
}

// Notification represents either a direct cloud function notification or a Pub/Sub message
type Notification struct {
	// For direct CloudEvent notifications
	EventType      string         `json:"event_type"`
	CloudEventData CloudEventData `json:"cloud_event_data"`

	// For Pub/Sub push notifications
	Message *struct {
		Data        string            `json:"data"`
		Attributes  map[string]string `json:"attributes"`
		MessageID   string            `json:"messageId"`
		PublishTime string            `json:"publishTime"`
	} `json:"message,omitempty"`
	Subscription string `json:"subscription,omitempty"`
}

func ParseNotification(c echo.Context) (Notification, error) {
	var n Notification

	bodyBytes, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return n, echo.NewHTTPError(http.StatusBadRequest, "failed to read body")
	}

	// Dump the raw POST body
	log.Infof("[ParseNotification] Raw POST body: %s", string(bodyBytes))

	c.Request().Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	log.Debugfc(c.Request().Context(), "ParseNotification body: %s", string(bodyBytes))

	if err := json.Unmarshal(bodyBytes, &n); err != nil {
		return n, echo.NewHTTPError(
			http.StatusBadRequest,
			fmt.Sprintf("invalid JSON: %v; body=%s", err, string(bodyBytes)),
		)
	}

	// If this is a Pub/Sub message, decode the base64 data and parse StorageObjectData
	if n.Message != nil && n.Message.Data != "" {
		log.Infof("[ParseNotification] Detected Pub/Sub message format")
		decodedData, err := base64.StdEncoding.DecodeString(n.Message.Data)
		if err != nil {
			return n, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("failed to decode base64 data: %v", err))
		}

		log.Infof("[ParseNotification] Decoded Pub/Sub data: %s", string(decodedData))

		var storageData CloudEventData
		if err := json.Unmarshal(decodedData, &storageData); err != nil {
			return n, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("failed to parse storage data: %v", err))
		}

		// Set the CloudEventData from the Pub/Sub message
		n.CloudEventData = storageData
		n.EventType = "pubsub"
	} else {
		log.Infof("[ParseNotification] Detected direct CloudEvent format")
	}

	log.Infof("[ParseNotification] Parsed notification - EventType: %s, FileName: %s, Bucket: %s",
		n.EventType, n.CloudEventData.Name, n.CloudEventData.Bucket)

	return n, nil
}

func GenFileName(workspaceID accountdomain.WorkspaceID, projectID id.ProjectID, userID accountdomain.UserID) string {
	return fmt.Sprintf("%s-%s-%s.zip", workspaceID.String(), projectID.String(), userID.String())
}

func SplitFilename(objectPath string) (string, *accountdomain.WorkspaceID, *id.ProjectID, *accountdomain.UserID, error) {

	base := filepath.Base(objectPath)

	filename := strings.TrimSuffix(base, filepath.Ext(base))
	parts := strings.SplitN(filename, "-", 3)
	if len(parts) != 3 {
		return base, nil, nil, nil, fmt.Errorf("invalid file name format: %s", filename)
	}

	workspaceID := parts[0]
	wid, err := accountdomain.WorkspaceIDFrom(workspaceID)
	if err != nil {
		return base, nil, nil, nil, fmt.Errorf("invalid workspace id: %v", err)
	}

	projectID := parts[1]
	pid, err := id.ProjectIDFrom(projectID)
	if err != nil {
		return base, nil, nil, nil, fmt.Errorf("invalid project id: %v", err)
	}

	userID := parts[2]
	uid, err := accountdomain.UserIDFrom(userID)
	if err != nil {
		return base, nil, nil, nil, fmt.Errorf("invalid user id: %v", err)
	}
	return base, &wid, &pid, &uid, nil
}

type WrappedHandler func(echo.Context, context.Context, *interfaces.Container, *usecase.Operator) (interface{}, error)

func SecurityHandler(cfg *ServerConfig, enableDataLoaders bool) func(WrappedHandler) echo.HandlerFunc {
	return func(handler WrappedHandler) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			uc := adapter.Usecases(ctx)
			ctx = gql.AttachUsecases(ctx, uc, enableDataLoaders)

			c.SetRequest(req.WithContext(ctx))

			// Since access from the storage trigger does not include an Auth token,
			// we supplement the operator.
			if req.Method == "POST" && (req.URL.Path == "/api/import-project" || req.URL.Path == "/api/storage-event") {
				n, err := ParseNotification(c)
				if err != nil {
					log.Errorf("import project ParseNotification err: %v", err)
					return err
				}
				fmt.Println("[Import Project] recv notification file_name: ", n.CloudEventData.Name)
				// _, _, _, userID, err := SplitFilename(n.CloudEventData.Name)
				// if err != nil {
				// 	log.Errorf("import project SplitFilename err: %v", err)
				// 	return err
				// }
				// u, err := cfg.AccountRepos.User.FindByID(ctx, *userID)
				// if err != nil {
				// 	log.Errorf("import project FindByID err: %v", err)
				// 	return err
				// }
// 				if u != nil {
// 					op, err := generateOperator(ctx, cfg, u)
// 					if err != nil {
// 						log.Errorf("import project generateOperator err: %v", err)
// 						return err
// 					}
// 
// 					ctx = adapter.AttachUser(ctx, u)
// 					ctx = adapter.AttachOperator(ctx, op)
// 				}
			}

			op := adapter.Operator(ctx)
			ctx = adapter.AttachCurrentHost(ctx, cfg.Config.Host)

			res, err := handler(c, ctx, uc, op)
			if err != nil {
				log.Errorf("upload handler err: %v", err)
				if he, ok := err.(*echo.HTTPError); ok {
					return he
				}
				return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
			}

			return c.JSON(http.StatusOK, res)
		}
	}
}

func CreateTemporaryProject(ctx context.Context, usecases *interfaces.Container, op *usecase.Operator, workspaceID accountdomain.WorkspaceID) (*project.Project, error) {

	visibility := string(project.VisibilityPublic)
	coreSupport := true
	isDeleted := true
	unknown := "It's importing now..."
	importResultLog := map[string]any{}
	importResultLog["message"] = "import start..."
	prj, err := usecases.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:     workspaceID,
		Visualizer:      visualizer.VisualizerCesium,
		Name:            &unknown,
		Description:     &unknown,
		CoreSupport:     &coreSupport,
		Visibility:      &visibility,
		ImportStatus:    project.ProjectImportStatusUploading, // UPLOADING
		ImportResultLog: &importResultLog,
		IsDeleted:       &isDeleted,
	},
		op,
	)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to create project: %v", err)
		return nil, echo.NewHTTPError(http.StatusBadRequest, errMsg)
	}

	log.Infof("[Import] creating temporary project id: %s", prj.ID().String())
	return prj, nil

}

func UpdateImportStatus(
	ctx context.Context,
	usecases *interfaces.Container,
	op *usecase.Operator,
	pid id.ProjectID,
	status project.ProjectImportStatus,
	message string,
	result map[string]any,
) {
	importResultLog := map[string]any{}
	importResultLog["message"] = message
	importResultLog["result"] = result
	if project.ProjectImportStatusFailed == status {
		log.Errorf("[Import Error] %s", message)
	}
	_, err := usecases.Project.UpdateImportStatus(ctx, pid, status, &importResultLog, op)
	if err != nil {
		log.Printf("failed to update import status: %v", err)
	}
}

func ImportProject(
	ctx context.Context,
	usecases *interfaces.Container,
	op *usecase.Operator,
	wsId accountdomain.WorkspaceID,
	pid id.ProjectID,
	importData *[]byte,
	assetsZip map[string]*zip.File,
	pluginsZip map[string]*zip.File,
	result map[string]any,
	version *string,
) bool {

	// project ----------
	newProject, err := usecases.Project.ImportProjectData(ctx, wsId.String(), pid.Ref().StringRef(), importData, op)
	if err != nil {
		errMsg := fmt.Sprintf("fail Import ProjectData: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}
	result["project"] = gqlmodel.ToProject(newProject)
	log.Infof("[Import] imported Project data")

	// asset ----------
	importData, asset, err := usecases.Asset.ImportAssetFiles(ctx, assetsZip, importData, newProject, op)
	if err != nil {
		errMsg := fmt.Sprintf("fail Import AssetFiles: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}
	result["asset"] = asset
	log.Infof("[Import] imported asset files")

	newScene, err := usecases.Scene.Create(ctx, newProject.ID(), false, op)
	if err != nil {
		errMsg := fmt.Sprintf("fail Create Scene: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}
	log.Infof("[Import] creating temporary scene id: %s", newScene.ID().String())

	oldSceneID, err := replaceOldSceneID(importData, newScene)
	if err != nil {
		errMsg := fmt.Sprintf("fail Get OldSceneID: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}

	// plugins/schemas ----------
	plugins, err := usecases.Plugin.ImportPlugins(ctx, pluginsZip, oldSceneID, newScene, importData)
	if err != nil {
		errMsg := fmt.Sprintf("fail ImportPlugins: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}
	result["plugins"] = plugins
	log.Infof("[Import] imported plugins")

	// scene ----------
	newScene, err = usecases.Scene.ImportSceneData(ctx, newScene, importData)
	if err != nil {
		errMsg := fmt.Sprintf("fail sceneJSON ImportSceneData: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}
	result["scene"] = gqlmodel.ToScene(newScene)
	log.Infof("[Import] imported Scene data")

	// style ----------
	styles, err := usecases.Style.ImportStyles(ctx, newScene.ID(), importData)
	if err != nil {
		errMsg := fmt.Sprintf("Error] fail sceneJSON ImportStyles: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}
	result["styles"] = styles
	log.Infof("[Import] imported Layerstyles data")

	// NLSLayer ----------
	layers, err := usecases.NLSLayer.ImportNLSLayers(ctx, newScene.ID(), importData)
	if err != nil {
		errMsg := fmt.Sprintf("fail sceneJSON ImportNLSLayers: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}
	result["layers"] = layers
	log.Infof("[Import] imported NLSLayers data")

	// story ----------
	story, err := usecases.StoryTelling.ImportStory(ctx, newScene.ID(), importData)
	if err != nil {
		errMsg := fmt.Sprintf("fail sceneJSON ImportStory: %v", err)
		UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusFailed, errMsg, result)
		return false
	}
	result["story"] = story
	log.Infof("[Import] imported Story data")

	msg := fmt.Sprintf("[Import Completed] Imported project: %s into workspace: %s", pid.String(), wsId)
	UpdateImportStatus(ctx, usecases, op, pid, project.ProjectImportStatusSuccess, msg, result) // SUCCESS
	return true

}
