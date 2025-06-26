package internalapi

import (
	"context"
	"fmt"
	"net/url"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/internalapi/internalapimodel"
	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
)

type server struct {
	pb.UnimplementedReEarthVisualizerServer
}

func NewServer() pb.ReEarthVisualizerServer {
	return &server{}
}

func (s server) GetProjectList(ctx context.Context, req *pb.GetProjectListRequest) (*pb.GetProjectListResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountdomain.WorkspaceIDFrom(req.WorkspaceId)

	if err != nil {
		return nil, err
	}

	res, err := uc.Project.FindVisibilityByWorkspace(ctx, wId, req.Authenticated, op)

	if err != nil {
		return nil, err
	}

	projects := make([]*pb.Project, 0, len(res))

	for _, p := range res {
		projects = append(projects, internalapimodel.ToProject(p))
	}

	return &pb.GetProjectListResponse{
		Projects: projects,
	}, nil

}

func (s server) GetProject(ctx context.Context, req *pb.GetProjectRequest) (*pb.GetProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := id.ProjectIDFrom(req.ProjectId)

	if err != nil {
		return nil, err
	}

	p, err := uc.Project.FindActiveById(ctx, pId, op)

	if err != nil {
		return nil, err
	}

	return &pb.GetProjectResponse{
		Project: internalapimodel.ToProject(p),
	}, nil
}

func (s server) CreateProject(ctx context.Context, req *pb.CreateProjectRequest) (*pb.CreateProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountdomain.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}

	p, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID: wId,
		Visualizer:  visualizer.Visualizer(req.Visualizer),
		Name:        req.Name,
		Description: req.Description,
		CoreSupport: req.CoreSupport,
		Visibility:  req.Visibility,
	}, op)
	if err != nil {
		return nil, err
	}

	c, err := uc.Scene.Create(ctx, p.ID(), true, op)
	if err != nil {
		return nil, err
	}

	index := 0
	storyInput := interfaces.CreateStoryInput{
		SceneID: c.ID(),
		Title:   "Default",
		Index:   &index,
	}
	st, err := uc.StoryTelling.Create(ctx, storyInput, op)
	if err != nil {
		return nil, err
	}

	title := "Page"
	swipeable := false
	pageParam := interfaces.CreatePageParam{
		SceneID:         c.ID(),
		StoryID:         st.Id(),
		Title:           &title,
		Swipeable:       &swipeable,
		Layers:          &[]id.NLSLayerID{},
		SwipeableLayers: &[]id.NLSLayerID{},
		Index:           &index,
		// ImportStatus:    status.ProjectImportStatusNone,
	}
	_, _, err = uc.StoryTelling.CreatePage(ctx, pageParam, op)
	if err != nil {
		return nil, err
	}

	return &pb.CreateProjectResponse{
		Project: internalapimodel.ToProject(p),
	}, nil
}

func (s server) UpdateProjectMetadata(ctx context.Context, req *pb.UpdateProjectMetadataRequest) (*pb.UpdateProjectMetadataResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pid, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	meta, err := uc.ProjectMetadata.Update(ctx, interfaces.UpdateProjectMetadataParam{
		ID:      pid,
		Readme:  req.Readme,
		License: req.License,
		Topics:  req.Topics,
	}, op)
	if err != nil {
		return nil, err
	}

	return &pb.UpdateProjectMetadataResponse{
		Metadata: internalapimodel.ToProjectMetadata(meta),
	}, nil
}

func (s server) UpdateProject(ctx context.Context, req *pb.UpdateProjectRequest) (*pb.UpdateProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	var imageURL *url.URL
	if req.ImageUrl != nil {
		parsedURL, err := url.Parse(*req.ImageUrl)
		if err != nil {
			return nil, fmt.Errorf("invalid image_url: %w", err)
		}
		imageURL = parsedURL
	}

	p, err := uc.Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:             pId,
		Name:           req.Name,
		Description:    req.Description,
		Archived:       req.Archived,
		ImageURL:       imageURL,
		DeleteImageURL: req.DeleteImageUrl != nil && *req.DeleteImageUrl,
		SceneID:        id.SceneIDFromRef(req.SceneId),
		Starred:        req.Starred,
		Deleted:        req.Deleted,
		Visibility:     req.Visibility,

		// publishment
		PublicTitle:       req.PublicTitle,
		PublicDescription: req.PublicDescription,
		PublicImage:       req.PublicImage,
		PublicNoIndex:     req.PublicNoIndex,
		DeletePublicImage: req.DeletePublicImage != nil && *req.DeletePublicImage,
		IsBasicAuthActive: req.IsBasicAuthActive,
		BasicAuthUsername: req.BasicAuthUsername,
		BasicAuthPassword: req.BasicAuthPassword,
		EnableGa:          req.EnableGa,
		TrackingID:        req.TrackingId,
	}, op)
	if err != nil {
		return nil, err
	}

	return &pb.UpdateProjectResponse{
		Project: internalapimodel.ToProject(p),
	}, nil

}

func (s server) DeleteProject(ctx context.Context, req *pb.DeleteProjectRequest) (*pb.DeleteProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := id.ProjectIDFrom(req.ProjectId)

	if err != nil {
		return nil, err
	}

	if err := uc.Project.Delete(ctx, pId, op); err != nil {
		return nil, err
	}

	return &pb.DeleteProjectResponse{
		ProjectId: pId.String(),
	}, nil
}
