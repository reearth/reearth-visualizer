package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/visualizer"
)

type ProjectControllerConfig struct {
	ProjectInput func() interfaces.Project
}

type ProjectController struct {
	config ProjectControllerConfig
}

func NewProjectController(config ProjectControllerConfig) *ProjectController {
	return &ProjectController{config: config}
}

func (c *ProjectController) usecase() interfaces.Project {
	if c == nil {
		return nil
	}
	return c.config.ProjectInput()
}

func (c *ProjectController) Create(ctx context.Context, i *CreateProjectInput, operator *usecase.Operator) (*ProjectPayload, error) {
	res, err := c.usecase().Create(ctx, interfaces.CreateProjectParam{
		TeamID:      id.TeamID(i.TeamID),
		Visualizer:  visualizer.Visualizer(i.Visualizer),
		Name:        i.Name,
		Description: i.Description,
		ImageURL:    i.ImageURL,
		Alias:       i.Alias,
		Archived:    i.Archived,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &ProjectPayload{Project: toProject(res)}, nil
}

func (c *ProjectController) Update(ctx context.Context, ginput *UpdateProjectInput, operator *usecase.Operator) (*ProjectPayload, error) {
	deletePublicImage := false
	if ginput.DeletePublicImage != nil {
		deletePublicImage = *ginput.DeletePublicImage
	}

	deleteImageURL := false
	if ginput.DeleteImageURL != nil {
		deleteImageURL = *ginput.DeleteImageURL
	}

	res, err := c.usecase().Update(ctx, interfaces.UpdateProjectParam{
		ID:                id.ProjectID(ginput.ProjectID),
		Name:              ginput.Name,
		Description:       ginput.Description,
		Alias:             ginput.Alias,
		ImageURL:          ginput.ImageURL,
		Archived:          ginput.Archived,
		IsBasicAuthActive: ginput.IsBasicAuthActive,
		BasicAuthUsername: ginput.BasicAuthUsername,
		BasicAuthPassword: ginput.BasicAuthPassword,
		PublicTitle:       ginput.PublicTitle,
		PublicDescription: ginput.PublicDescription,
		PublicImage:       ginput.PublicImage,
		PublicNoIndex:     ginput.PublicNoIndex,
		DeletePublicImage: deletePublicImage,
		DeleteImageURL:    deleteImageURL,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &ProjectPayload{Project: toProject(res)}, nil
}

func (c *ProjectController) CheckAlias(ctx context.Context, alias string) (*CheckProjectAliasPayload, error) {
	ok, err := c.usecase().CheckAlias(ctx, alias)
	if err != nil {
		return nil, err
	}

	return &CheckProjectAliasPayload{Alias: alias, Available: ok}, nil
}

func (c *ProjectController) Publish(ctx context.Context, ginput *PublishProjectInput, operator *usecase.Operator) (*ProjectPayload, error) {
	res, err := c.usecase().Publish(ctx, interfaces.PublishProjectParam{
		ID:     id.ProjectID(ginput.ProjectID),
		Alias:  ginput.Alias,
		Status: fromPublishmentStatus(ginput.Status),
	}, operator)
	if err != nil {
		return nil, err
	}

	return &ProjectPayload{Project: toProject(res)}, nil
}

func (c *ProjectController) Delete(ctx context.Context, ginput *DeleteProjectInput, operator *usecase.Operator) (*DeleteProjectPayload, error) {
	err := c.usecase().Delete(ctx, id.ProjectID(ginput.ProjectID), operator)
	if err != nil {
		return nil, err
	}

	return &DeleteProjectPayload{ProjectID: ginput.ProjectID}, nil
}
