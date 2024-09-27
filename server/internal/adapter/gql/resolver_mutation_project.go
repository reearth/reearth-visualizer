package gql

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/oklog/ulid"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/spf13/afero"
	"golang.org/x/exp/rand"
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

	t := time.Now().UTC()
	entropy := ulid.Monotonic(rand.New(rand.NewSource(uint64(t.UnixNano()))), 0)
	name := ulid.MustNew(ulid.Timestamp(t), entropy)
	zipFile, err := fs.Create(fmt.Sprintf("%s.reearth", name.String()))
	if err != nil {
		return nil, err
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
	prj, err := usecases(ctx).Project.ExportProject(ctx, pid, zipWriter, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	sce, data, err := usecases(ctx).Scene.ExportScene(ctx, prj, zipWriter)
	if err != nil {
		return nil, err
	}
	data["project"] = gqlmodel.ToProject(prj)

	plgs, err := usecases(ctx).Plugin.ExportPlugins(ctx, sce, zipWriter)
	if err != nil {
		return nil, err
	}
	data["plugins"] = gqlmodel.ToPlugins(plgs)

	err = usecases(ctx).Project.UploadExportProjectZip(ctx, zipWriter, zipFile, data, prj)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ExportProjectPayload{
		ProjectDataPath: "/export/" + zipFile.Name(),
	}, nil
}

func (r *mutationResolver) ImportProject(ctx context.Context, input gqlmodel.ImportProjectInput) (*gqlmodel.ImportProjectPayload, error) {

	data, assets, plugins, err := file.UncompressExportZip(input.File.File)
	if err != nil {
		return nil, err
	}

	// Assets file import
	changedFileName := make(map[string]string)
	for fileName, file := range assets {
		parts1 := strings.Split(fileName, "/")
		beforeName := parts1[0]

		url, _, err := usecases(ctx).Asset.UploadAssetFile(ctx, beforeName, file)
		if err != nil {
			return nil, err
		}
		parts2 := strings.Split(url.Path, "/")
		afterName := parts2[len(parts2)-1]

		changedFileName[beforeName] = afterName
	}

	// Plugin file import
	for fileName, file := range plugins {
		parts := strings.Split(fileName, "/")
		pid, err := id.PluginIDFrom(parts[0])
		if err != nil {
			return nil, err
		}
		if err := usecases(ctx).Plugin.ImporPluginFile(ctx, pid, parts[1], file); err != nil {
			return nil, err
		}
	}

	for beforeName, afterName := range changedFileName {
		data = bytes.Replace(data, []byte(beforeName), []byte(afterName), -1)
	}

	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, err
	}

	projectData, _ := jsonData["project"].(map[string]interface{})
	prj, tx, err := usecases(ctx).Project.ImportProject(ctx, projectData)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	pluginsData, _ := jsonData["plugins"].([]interface{})
	plgs, err := usecases(ctx).Plugin.ImportPlugins(ctx, pluginsData)
	if err != nil {
		return nil, err
	}

	sceneData, _ := jsonData["scene"].(map[string]interface{})
	sce, err := usecases(ctx).Scene.ImportScene(ctx, prj, plgs, sceneData)
	if err != nil {
		return nil, err
	}

	nlayers, err := usecases(ctx).NLSLayer.ImportNLSLayers(ctx, sceneData)
	if err != nil {
		return nil, err
	}

	styleList, err := usecases(ctx).Style.ImportStyles(ctx, sceneData)
	if err != nil {
		return nil, err
	}

	st, err := usecases(ctx).StoryTelling.ImportStory(ctx, sceneData)
	if err != nil {
		return nil, err
	}

	tx.Commit()

	return &gqlmodel.ImportProjectPayload{
		ProjectData: map[string]any{
			"project":  gqlmodel.ToProject(prj),
			"plugins":  gqlmodel.ToPlugins(plgs),
			"scene":    gqlmodel.ToScene(sce),
			"nlsLayer": gqlmodel.ToNLSLayers(nlayers, nil),
			"style":    gqlmodel.ToStyles(styleList),
			"story":    gqlmodel.ToStory(st),
		},
	}, nil

}
