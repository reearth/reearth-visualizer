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
		ImageURL:    input.ImageURL,
		Alias:       input.Alias,
		Archived:    input.Archived,
		CoreSupport: input.CoreSupport,
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
		ID:                pid,
		Name:              input.Name,
		Description:       input.Description,
		Alias:             input.Alias,
		ImageURL:          input.ImageURL,
		Archived:          input.Archived,
		IsBasicAuthActive: input.IsBasicAuthActive,
		BasicAuthUsername: input.BasicAuthUsername,
		BasicAuthPassword: input.BasicAuthPassword,
		PublicTitle:       input.PublicTitle,
		PublicDescription: input.PublicDescription,
		PublicImage:       input.PublicImage,
		PublicNoIndex:     input.PublicNoIndex,
		DeletePublicImage: deletePublicImage,
		DeleteImageURL:    deleteImageURL,
		EnableGa:          input.EnableGa,
		TrackingID:        input.TrackingID,
		Starred:           input.Starred,
		Deleted:           input.Deleted,
		SceneID:           gqlmodel.ToIDRef[id.Scene](input.SceneID),
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

	// export project
	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}
	prj, err := usecases(ctx).Project.ExportProjectData(ctx, pid, zipWriter, getOperator(ctx))
	if err != nil {
		return nil, errors.New("Fail ExportProject :" + err.Error())
	}

	sce, data, err := usecases(ctx).Scene.ExportScene(ctx, prj)
	if err != nil {
		return nil, errors.New("Fail ExportScene :" + err.Error())
	}

	plgs, schemas, err := usecases(ctx).Plugin.ExportPlugins(ctx, sce, zipWriter)
	if err != nil {
		return nil, errors.New("Fail ExportPlugins :" + err.Error())
	}

	data["project"] = gqlmodel.ToProjectExport(prj)
	data["plugins"] = gqlmodel.ToPlugins(plgs)
	data["schemas"] = gqlmodel.ToPropertySchemas(schemas)

	exportedInfo := make(map[string]string)
	exportedInfo["host"] = adapter.CurrentHost(ctx)
	exportedInfo["project"] = prj.ID().String()
	exportedInfo["timestamp"] = time.Now().Format(time.RFC3339)
	data["exportedInfo"] = exportedInfo

	err = usecases(ctx).Project.UploadExportProjectZip(ctx, zipWriter, zipFile, Normalize(data), prj)
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

	workspace, _ := accountdomain.WorkspaceIDFrom(string(input.TeamID))

	tempData, assets, plugins, err := file.UncompressExportZip(input.File.File)
	if err != nil {
		return nil, errors.New("Fail UncompressExportZip :" + err.Error())
	}

	op := getOperator(ctx)

	// First, create the project. A project associated with the asset is required.
	newProject, tx, err := usecases(ctx).Project.ImportProjectData(ctx, workspace, tempData, op)
	if err != nil {
		return nil, errors.New("Fail ImportProjectData :" + err.Error())
	}

	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	tempData, err = usecases(ctx).Asset.ImportAssetFiles(ctx, assets, tempData, newProject)
	if err != nil {
		return nil, errors.New("Fail ImportAssetFiles :" + err.Error())
	}

	newScene, err := usecases(ctx).Scene.Create(ctx, newProject.ID(), op)
	if err != nil {
		return nil, err
	}

	oldSceneID, err := getOldSceneID(tempData)
	if err != nil {
		return nil, err
	}
	tempData = bytes.Replace(tempData, []byte(oldSceneID), []byte(newScene.ID().String()), -1)

	// Plugin file upload
	if err := usecases(ctx).Plugin.ImporPluginFile(ctx, plugins, oldSceneID, newScene.ID().String()); err != nil {
		return nil, errors.New("Fail ImporPluginFile :" + err.Error())
	}

	pluginsData, sceneJsonData, schemaData, err := unmarshalPluginsScene(tempData)
	if err != nil {
		return nil, err
	}

	// Plugin data save
	plgs, pss, err := usecases(ctx).Plugin.ImportPlugins(ctx, newScene, pluginsData, schemaData)
	if err != nil {
		return nil, errors.New("Fail ImportPlugins :" + err.Error())
	}

	//　The following is the saving of sceneJSON. -----------------------

	// Scene data save
	newScene, err = usecases(ctx).Scene.ImportScene(ctx, newScene, newProject, plgs, sceneJsonData)
	if err != nil {
		return nil, errors.New("Fail sceneJSON ImportScene :" + err.Error())
	}

	// Styles data save
	styleList, replaceStyleIDs, err := usecases(ctx).Style.ImportStyles(ctx, newScene.ID(), sceneJsonData)
	if err != nil {
		return nil, errors.New("Fail sceneJSON ImportStyles :" + err.Error())
	}

	// NLSLayers data save
	nlayers, replaceNLSLayerIDs, err := usecases(ctx).NLSLayer.ImportNLSLayers(ctx, newScene.ID(), sceneJsonData, replaceStyleIDs)
	if err != nil {
		return nil, errors.New("Fail sceneJSON ImportNLSLayers :" + err.Error())
	}

	// Story data save
	st, err := usecases(ctx).StoryTelling.ImportStory(ctx, newScene.ID(), sceneJsonData, replaceNLSLayerIDs)
	if err != nil {
		return nil, errors.New("Fail sceneJSON ImportStory :" + err.Error())
	}

	tx.Commit()

	return &gqlmodel.ImportProjectPayload{
		ProjectData: map[string]any{
			"project":  gqlmodel.ToProject(newProject),
			"plugins":  gqlmodel.ToPlugins(plgs),
			"schema":   gqlmodel.ToPropertySchemas(pss),
			"scene":    gqlmodel.ToScene(newScene),
			"nlsLayer": gqlmodel.ToNLSLayers(nlayers, nil),
			"style":    gqlmodel.ToStyles(styleList),
			"story":    gqlmodel.ToStory(st),
		},
	}, nil

}

func getOldSceneID(data []byte) (string, error) {
	var d map[string]any
	if err := json.Unmarshal(data, &d); err != nil {
		return "", err
	}
	if s, ok := d["scene"].(map[string]any); ok {
		if id, ok := s["id"].(string); ok {
			return id, nil
		}
	}
	return "", errors.New("scene id not found")
}

func unmarshalPluginsScene(data []byte) ([]any, map[string]any, []any, error) {
	var d map[string]any
	if err := json.Unmarshal(data, &d); err != nil {
		return nil, nil, nil, err
	}

	pluginsData, _ := d["plugins"].([]any)
	sceneData, _ := d["scene"].(map[string]any)
	schemaData, _ := d["schemas"].([]any)
	return pluginsData, sceneData, schemaData, nil
}
