package gql

import (
	"context"
	"encoding/json"
	"io"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
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

	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}

	prj, res, plgs, err := usecases(ctx).Project.ExportProject(ctx, pid, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	res["project"] = gqlmodel.ToProject(prj)
	res["plugins"] = gqlmodel.ToPlugins(plgs)

	return &gqlmodel.ExportProjectPayload{
		ProjectData: res,
	}, nil

}

func (r *mutationResolver) ImportProject(ctx context.Context, input gqlmodel.ImportProjectInput) (*gqlmodel.ImportProjectPayload, error) {

	fileBytes, err := io.ReadAll(input.File.File)
	if err != nil {
		return nil, err
	}

	var jsonData map[string]interface{}
	if err := json.Unmarshal(fileBytes, &jsonData); err != nil {
		return nil, err
	}

	projectData, _ := jsonData["project"].(map[string]interface{})
	prj, err := usecases(ctx).Project.ImportProject(ctx, projectData)
	if err != nil {
		return nil, err
	}

	pluginsData, _ := jsonData["plugins"].([]interface{})
	_, err = usecases(ctx).Plugin.ImportPlugins(ctx, pluginsData)
	if err != nil {
		return nil, err
	}

	sceneData, _ := jsonData["scene"].(map[string]interface{})
	_, err = usecases(ctx).Scene.ImportScene(ctx, prj, sceneData)
	if err != nil {
		return nil, err
	}

	_, err = usecases(ctx).NLSLayer.ImportNLSLayers(ctx, sceneData)
	if err != nil {
		return nil, err
	}

	_, err = usecases(ctx).Style.ImportStyles(ctx, sceneData)
	if err != nil {
		return nil, err
	}

	_, err = usecases(ctx).StoryTelling.ImportStoryTelling(ctx, sceneData)
	if err != nil {
		return nil, err
	}

	prj, res, plgs, err := usecases(ctx).Project.ExportProject(ctx, prj.ID(), getOperator(ctx))
	if err != nil {
		return nil, err
	}
	res["project"] = gqlmodel.ToProject(prj)
	res["plugins"] = gqlmodel.ToPlugins(plgs)

	return &gqlmodel.ImportProjectPayload{
		ProjectData: res,
	}, nil

}
