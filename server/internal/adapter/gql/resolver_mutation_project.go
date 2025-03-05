package gql

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path"
	"strings"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
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

	sce, data, err := usecases(ctx).Scene.ExportScene(ctx, prj, zipWriter)
	if err != nil {
		return nil, errors.New("Fail ExportScene :" + err.Error())
	}

	plgs, schemas, err := usecases(ctx).Plugin.ExportPlugins(ctx, sce, zipWriter)
	if err != nil {
		return nil, errors.New("Fail ExportPlugins :" + err.Error())
	}

	page := usecasex.CursorPagination{
		First: lo.ToPtr(int64(-1)),
	}.Wrap()
	sort := &asset.SortType{
		Key:  "id",
		Desc: true,
	}

	assets, _, err := usecases(ctx).Asset.FindByWorkspaceProject(ctx, prj.Workspace(), nil, nil, sort, page, getOperator(ctx))
	if err != nil {
		return nil, errors.New("Fail ExportAsset :" + err.Error())
	}
	assetNames := make(map[string]string)
	for _, a := range gqlmodel.ToAssets(assets) {
		parsedURL, err := url.Parse(a.URL)
		if err != nil {
			return nil, errors.New("Error parsing URL:" + err.Error())
		}
		fileName := path.Base(parsedURL.Path)
		assetNames[fileName] = a.Name
	}

	data["project"] = gqlmodel.ToProjectExport(prj)
	data["plugins"] = gqlmodel.ToPlugins(plgs)
	data["schemas"] = gqlmodel.ToPropertySchemas(schemas)
	data["assets"] = assetNames

	err = usecases(ctx).Project.UploadExportProjectZip(ctx, zipWriter, zipFile, data, prj)
	if err != nil {
		return nil, errors.New("Fail UploadExportProjectZip :" + err.Error())
	}

	return &gqlmodel.ExportProjectPayload{
		ProjectDataPath: "/export/" + zipFile.Name(),
	}, nil
}

func (r *mutationResolver) ImportProject(ctx context.Context, input gqlmodel.ImportProjectInput) (*gqlmodel.ImportProjectPayload, error) {

	workspace, _ := accountdomain.WorkspaceIDFrom(string(input.TeamID))

	tempData, assets, plugins, err := file.UncompressExportZip(input.File.File)
	if err != nil {
		return nil, errors.New("Fail UncompressExportZip :" + err.Error())
	}

	op := getOperator(ctx)

	// First, create the project. A project associated with the asset is required.
	projectData, _ := unmarshalProject(tempData)
	prj, tx, err := usecases(ctx).Project.ImportProjectData(ctx, workspace, projectData, op)
	if err != nil {
		return nil, errors.New("Fail ImportProject :" + err.Error())
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	// If the project has an image, the old image path is set at this stage.
	var oldProjectImage string
	if prj.ImageURL() != nil {
		oldProjectImage = path.Base(prj.ImageURL().Path)
	}

	pid, err := id.ProjectIDFrom(prj.ID().String())
	if err != nil {
		return nil, errors.New(err.Error())
	}

	// Assets file import
	assetNames, _ := unmarshalAssets(tempData)
	for beforeName, file := range assets {
		realName := assetNames[beforeName]

		// When an asset is registered, a new file URL is created.
		url, _, err := usecases(ctx).Asset.ImportAssetFiles(ctx, realName, file, workspace, &pid)
		if err != nil {
			return nil, errors.New("Fail ImportAssetFiles :" + err.Error())
		}

		if oldProjectImage == beforeName {
			prj, err = usecases(ctx).Project.Update(ctx, interfaces.UpdateProjectParam{
				ID:       pid,
				ImageURL: url,
			}, getOperator(ctx))
			if err != nil {
				return nil, err
			}
		}

		afterName := path.Base(url.Path)
		tempData = bytes.Replace(tempData, []byte(beforeName), []byte(afterName), -1)
	}

	// need to create a Scene firstｓ
	sce, err := usecases(ctx).Scene.Create(ctx, prj.ID(), op)
	if err != nil {
		return nil, err
	}

	newSceneID := sce.ID().String()

	// Replace the SceneID with the new SceneID
	oldSceneID, tempData, _ := replaceOldSceneID(tempData, newSceneID)

	// Plugin file upload
	for fileName, file := range plugins {

		parts := strings.Split(fileName, "/")
		oldPID := parts[0]
		fileName := parts[1]

		// this is the name of the file path
		newPluginId := strings.Replace(oldPID, oldSceneID, newSceneID, 1)

		if err := usecases(ctx).Plugin.ImporPluginFile(ctx, newPluginId, fileName, file); err != nil {
			return nil, errors.New("Fail ImporPluginFile :" + err.Error())
		}
	}

	pluginsData, sceneData, schemaData, _ := unmarshalPluginsScene(tempData)

	// Plugin data save
	plgs, pss, err := usecases(ctx).Plugin.ImportPlugins(ctx, sce, pluginsData, schemaData)
	if err != nil {
		return nil, errors.New("Fail ImportPlugins :" + err.Error())
	}

	// Scene data save
	sce, err = usecases(ctx).Scene.ImportScene(ctx, sce, prj, plgs, sceneData)
	if err != nil {
		return nil, errors.New("Fail ImportScene :" + err.Error())
	}

	// Styles data save
	styleList, replaceStyleIDs, err := usecases(ctx).Style.ImportStyles(ctx, sce.ID(), sceneData)
	if err != nil {
		return nil, errors.New("Fail ImportStyles :" + err.Error())
	}

	// NLSLayers data save
	nlayers, replaceNLSLayerIDs, err := usecases(ctx).NLSLayer.ImportNLSLayers(ctx, sce.ID(), sceneData, replaceStyleIDs)
	if err != nil {
		return nil, errors.New("Fail ImportNLSLayers :" + err.Error())
	}

	// Story data save
	st, err := usecases(ctx).StoryTelling.ImportStory(ctx, sce.ID(), sceneData, replaceNLSLayerIDs)
	if err != nil {
		return nil, errors.New("Fail ImportStory :" + err.Error())
	}

	tx.Commit()

	return &gqlmodel.ImportProjectPayload{
		ProjectData: map[string]any{
			"project":  gqlmodel.ToProject(prj),
			"plugins":  gqlmodel.ToPlugins(plgs),
			"schema":   gqlmodel.ToPropertySchemas(pss),
			"scene":    gqlmodel.ToScene(sce),
			"nlsLayer": gqlmodel.ToNLSLayers(nlayers, nil),
			"style":    gqlmodel.ToStyles(styleList),
			"story":    gqlmodel.ToStory(st),
		},
	}, nil

}

func replaceOldSceneID(data []byte, newSceneID string) (string, []byte, error) {
	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return "", nil, err
	}

	oldSceneData, _ := jsonData["scene"].(map[string]interface{})
	oldSceneID := oldSceneData["id"].(string)
	return oldSceneID, bytes.Replace(data, []byte(oldSceneID), []byte(newSceneID), -1), nil
}

func unmarshalProject(data []byte) (map[string]interface{}, error) {
	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, err
	}

	projectData, _ := jsonData["project"].(map[string]interface{})
	return projectData, nil
}

func unmarshalAssets(data []byte) (map[string]string, error) {
	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, err
	}

	assets, _ := jsonData["assets"].(map[string]interface{})
	assetNames := make(map[string]string)
	for k, v := range assets {
		strValue, _ := v.(string)
		assetNames[k] = strValue
	}

	return assetNames, nil
}

func unmarshalPluginsScene(data []byte) ([]interface{}, map[string]interface{}, []interface{}, error) {
	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, nil, nil, err
	}

	pluginsData, _ := jsonData["plugins"].([]interface{})
	sceneData, _ := jsonData["scene"].(map[string]interface{})
	schemaData, _ := jsonData["schemas"].([]interface{})
	return pluginsData, sceneData, schemaData, nil
}
