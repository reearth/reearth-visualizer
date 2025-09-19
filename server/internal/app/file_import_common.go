package app

import (
	"archive/zip"
	"context"
	"fmt"
	"net/http"

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

type WrappedHandler func(echo.Context, context.Context, *interfaces.Container, *usecase.Operator) (interface{}, error)

func SecurityHandler(enableDataLoaders bool) func(WrappedHandler) echo.HandlerFunc {
	return func(handler WrappedHandler) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			uc := adapter.Usecases(ctx)
			ctx = gql.AttachUsecases(ctx, uc, enableDataLoaders)

			c.SetRequest(req.WithContext(ctx))

			op := adapter.Operator(ctx)
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

func CreateTemporaryProject(ctx context.Context, usecases *interfaces.Container, op *usecase.Operator, wsId string) (*project.Project, error) {

	visibility := string(project.VisibilityPublic)
	coreSupport := true
	isDeleted := true
	unknown := "It's importing now..."
	workspaceID, err := accountdomain.WorkspaceIDFrom(wsId)
	if err != nil {
		errMsg := fmt.Sprintf("Invalid workspace id: %v", err)
		return nil, echo.NewHTTPError(http.StatusBadRequest, errMsg)
	}
	imporResultLog := map[string]any{}
	imporResultLog["message"] = "import start..."
	prj, err := usecases.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:    workspaceID,
		Visualizer:     visualizer.VisualizerCesium,
		Name:           &unknown,
		Description:    &unknown,
		CoreSupport:    &coreSupport,
		Visibility:     &visibility,
		ImportStatus:   project.ProjectImportStatusUploading, // UPLOADING
		ImporResultLog: &imporResultLog,
		IsDeleted:      &isDeleted,
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
	imporResultLog := map[string]any{}
	imporResultLog["message"] = message
	imporResultLog["result"] = result
	if project.ProjectImportStatusFailed == status {
		log.Errorf("[Import Error] %s", message)
	}
	_, err := usecases.Project.UpdateImportStatus(ctx, pid, status, &imporResultLog, op)
	if err != nil {
		log.Printf("failed to update import status: %v", err)
	}
}

func ImportProject(
	ctx context.Context,
	usecases *interfaces.Container,
	op *usecase.Operator,
	wsId string,
	pid id.ProjectID,
	importData *[]byte,
	assetsZip map[string]*zip.File,
	pluginsZip map[string]*zip.File,
	result map[string]any,
) bool {

	// project ----------
	newProject, err := usecases.Project.ImportProjectData(ctx, wsId, pid.Ref().StringRef(), importData, op)
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
