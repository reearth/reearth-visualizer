package gql

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/spf13/afero"
)

func (r *mutationResolver) CreateProject(ctx context.Context, input gqlmodel.CreateProjectInput) (*gqlmodel.ProjectPayload, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](input.TeamID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: tid,
		Visualizer:  visualizer.Visualizer(input.Visualizer),
		Name:        input.Name,
		Description: input.Description,
		CoreSupport: input.CoreSupport,
		Visibility:  input.Visibility,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectPayload{Project: gqlmodel.ToProject(res)}, nil
}

func (r *mutationResolver) UpdateProject(ctx context.Context, input gqlmodel.UpdateProjectInput) (*gqlmodel.ProjectPayload, error) {
	deletePublicImage := false
	if input.DeletePublicImage != nil {
		deletePublicImage = *input.DeletePublicImage
	}

	deleteImageURL := false
	if input.DeleteImageURL != nil {
		deleteImageURL = *input.DeleteImageURL
	}

	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:             pid,
		Name:           input.Name,
		Description:    input.Description,
		Readme:         input.Readme,
		License:        input.License,
		ImageURL:       input.ImageURL,
		Archived:       input.Archived,
		DeleteImageURL: deleteImageURL,
		Starred:        input.Starred,
		Deleted:        input.Deleted,
		SceneID:        gqlmodel.ToIDRef[id.Scene](input.SceneID),
		Visibility:     input.Visibility,

		// publishment
		PublicTitle:       input.PublicTitle,
		PublicDescription: input.PublicDescription,
		PublicImage:       input.PublicImage,
		PublicNoIndex:     input.PublicNoIndex,
		DeletePublicImage: deletePublicImage,
		IsBasicAuthActive: input.IsBasicAuthActive,
		BasicAuthUsername: input.BasicAuthUsername,
		BasicAuthPassword: input.BasicAuthPassword,
		EnableGa:          input.EnableGa,
		TrackingID:        input.TrackingID,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectPayload{Project: gqlmodel.ToProject(res)}, nil
}

func (r *mutationResolver) PublishProject(ctx context.Context, input gqlmodel.PublishProjectInput) (*gqlmodel.ProjectPayload, error) {
	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Project.Publish(ctx, interfaces.PublishProjectParam{
		ID:     pid,
		Alias:  input.Alias,
		Status: gqlmodel.FromPublishmentStatus(input.Status),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectPayload{Project: gqlmodel.ToProject(res)}, nil
}

func (r *mutationResolver) DeleteProject(ctx context.Context, input gqlmodel.DeleteProjectInput) (*gqlmodel.DeleteProjectPayload, error) {
	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).Project.Delete(ctx, pid, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteProjectPayload{ProjectID: input.ProjectID}, nil
}

func (r *mutationResolver) ExportProject(ctx context.Context, input gqlmodel.ExportProjectInput) (*gqlmodel.ExportProjectPayload, error) {
	fs := afero.NewOsFs()

	zipFile, err := fs.Create(fmt.Sprintf("%s.zip", strings.ToLower(string(input.ProjectID))))
	if err != nil {
		return nil, errors.New("Fail Zip Create :" + err.Error())
	}
	defer func() {
		if cerr := zipFile.Close(); cerr != nil && err == nil {
			err = cerr
		}
		//　delete after saving to storage
		if cerr := os.Remove(zipFile.Name()); cerr != nil && err == nil {
			err = cerr
		}
	}()
	zipWriter := zip.NewWriter(zipFile)
	defer func() {
		if cerr := zipWriter.Close(); cerr != nil && err == nil {
			err = cerr
		}
	}()

	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}
	prj, err := usecases(ctx).Project.ExportProjectData(ctx, pid, zipWriter, getOperator(ctx))
	if err != nil {
		return nil, errors.New("Fail ExportProject :" + err.Error())
	}

	sce, exportData, err := usecases(ctx).Scene.ExportScene(ctx, prj)
	if err != nil {
		return nil, errors.New("Fail ExportScene :" + err.Error())
	}

	plugins, schemas, err := usecases(ctx).Plugin.ExportPlugins(ctx, sce, zipWriter)
	if err != nil {
		return nil, errors.New("Fail ExportPlugins :" + err.Error())
	}

	exportData["project"] = gqlmodel.ToProjectExport(prj)
	exportData["plugins"] = gqlmodel.ToPlugins(plugins)
	exportData["schemas"] = gqlmodel.ToPropertySchemas(schemas)
	exportData["exportedInfo"] = map[string]string{
		"host":      adapter.CurrentHost(ctx),
		"project":   prj.ID().String(),
		"timestamp": time.Now().Format(time.RFC3339),
	}

	err = usecases(ctx).Project.UploadExportProjectZip(ctx, zipWriter, zipFile, Normalize(exportData), prj)
	if err != nil {
		return nil, errors.New("Fail UploadExportProjectZip :" + err.Error())
	}

	return &gqlmodel.ExportProjectPayload{
		ProjectDataPath: "/export/" + zipFile.Name(),
	}, nil
}

func Normalize(data any) map[string]any {
	if b, err := json.Marshal(data); err == nil {
		var result map[string]any
		if err := json.Unmarshal(b, &result); err == nil {
			return result
		}
	}
	return nil
}

func (r *mutationResolver) ImportProject(ctx context.Context, input gqlmodel.ImportProjectInput) (*gqlmodel.ImportProjectPayload, error) {

	importData, assetsZip, pluginsZip, err := file.UncompressExportZip(adapter.CurrentHost(ctx), input.File.File)
	if err != nil {
		return nil, errors.New("Fail UncompressExportZip :" + err.Error())
	}

	// First, create the project. A project associated with the asset is required.
	newProject, err := usecases(ctx).Project.ImportProjectData(ctx, string(input.TeamID), importData, getOperator(ctx))
	if err != nil {
		return nil, errors.New("Fail Import ProjectData :" + err.Error())
	}

	importData, err = usecases(ctx).Asset.ImportAssetFiles(ctx, assetsZip, importData, newProject)
	if err != nil {
		return nil, errors.New("Fail Import AssetFiles :" + err.Error())
	}

	newScene, err := usecases(ctx).Scene.Create(ctx, newProject.ID(), false, getOperator(ctx))
	if err != nil {
		return nil, errors.New("Fail Create Scene :" + err.Error())
	}

	oldSceneID, err := replaceOldSceneID(importData, newScene)
	if err != nil {
		return nil, errors.New("Fail Get OldSceneID :" + err.Error())
	}

	plugins, pss, err := usecases(ctx).Plugin.ImportPlugins(ctx, pluginsZip, oldSceneID, newScene, importData)
	if err != nil {
		return nil, errors.New("Fail ImportPlugins :" + err.Error())
	}

	//　The following is the saving of sceneJSON. -----------------------

	// Scene data save
	newScene, err = usecases(ctx).Scene.ImportScene(ctx, newScene, importData)
	if err != nil {
		return nil, errors.New("Fail sceneJSON ImportScene :" + err.Error())
	}

	// Styles data save
	styleList, err := usecases(ctx).Style.ImportStyles(ctx, newScene.ID(), importData)
	if err != nil {
		return nil, errors.New("Fail sceneJSON ImportStyles :" + err.Error())
	}

	// NLSLayers data save
	nlayers, err := usecases(ctx).NLSLayer.ImportNLSLayers(ctx, newScene.ID(), importData)
	if err != nil {
		return nil, errors.New("Fail sceneJSON ImportNLSLayers :" + err.Error())
	}

	// Story data save
	st, err := usecases(ctx).StoryTelling.ImportStory(ctx, newScene.ID(), importData)
	if err != nil {
		return nil, errors.New("Fail sceneJSON ImportStory :" + err.Error())
	}

	return &gqlmodel.ImportProjectPayload{
		ProjectData: map[string]any{
			"project":  gqlmodel.ToProject(newProject),
			"plugins":  gqlmodel.ToPlugins(plugins),
			"schemas":  gqlmodel.ToPropertySchemas(pss),
			"scene":    gqlmodel.ToScene(newScene),
			"nlsLayer": gqlmodel.ToNLSLayers(nlayers, nil),
			"style":    gqlmodel.ToStyles(styleList),
			"story":    gqlmodel.ToStory(st),
		},
	}, nil

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
