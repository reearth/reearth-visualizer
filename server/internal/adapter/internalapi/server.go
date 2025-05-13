package internalapi

import (
	"context"

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

	wId, err := accountdomain.WorkspaceIDFrom(req.TeamId)

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

	wId, err := accountdomain.WorkspaceIDFrom(req.TeamId)
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
	}
	_, _, err = uc.StoryTelling.CreatePage(ctx, pageParam, op)
	if err != nil {
		return nil, err
	}

	return &pb.CreateProjectResponse{
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
