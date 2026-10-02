package apiv1

import (
	"context"
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/apperr"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

const (
	defaultLimit = 20
	maxLimit     = 100
	// defaultStoryTitle matches what the web app names the first story.
	defaultStoryTitle = "Default"
)

func (Server) ListProjects(ctx context.Context, req ListProjectsRequestObject) (ListProjectsResponseObject, error) {
	uc, op := usecases(ctx)
	wid, err := accountsID.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, invalidInput("invalid workspace ID %q", req.WorkspaceId)
	}
	p := req.Params

	limit := defaultLimit
	if p.Limit != nil {
		limit = *p.Limit
	}
	if limit < 1 || limit > maxLimit {
		return nil, invalidInput("limit must be between 1 and %d", maxLimit)
	}
	pagination := usecasex.CursorPagination{
		First: lo.ToPtr(int64(limit)),
		After: (*usecasex.Cursor)(p.Cursor),
	}.Wrap()

	starred, deleted := lo.FromPtr(p.Starred), lo.FromPtr(p.Deleted)
	var (
		res []*project.Project
		pi  *usecasex.PageInfo
	)
	switch {
	case starred && deleted:
		return nil, invalidInput("starred and deleted cannot be combined")
	case starred:
		res, pi, err = uc.Project.FindStarredByWorkspace(ctx, wid, pagination, op)
	case deleted:
		res, pi, err = uc.Project.FindDeletedByWorkspace(ctx, wid, pagination, op)
	default:
		sort, serr := toSortType(p.Sort)
		if serr != nil {
			return nil, serr
		}
		res, pi, err = uc.Project.FindByWorkspace(ctx, wid, p.Keyword, sort, pagination, op)
	}
	if err != nil {
		return nil, err
	}

	items, err := toProjectsWithScenes(ctx, uc, res)
	if err != nil {
		return nil, err
	}
	list := ProjectList{Items: items}
	if pi != nil {
		list.TotalCount = pi.TotalCount
		if pi.HasNextPage && pi.EndCursor != nil {
			list.NextCursor = lo.ToPtr(string(*pi.EndCursor))
		}
	}
	return ListProjects200JSONResponse(list), nil
}

// CreateProject creates the project with a scene and a first story page, the
// same set the web app creates, so the project opens in the editor as usual.
func (Server) CreateProject(ctx context.Context, req CreateProjectRequestObject) (CreateProjectResponseObject, error) {
	uc, op := usecases(ctx)
	wid, err := accountsID.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, invalidInput("invalid workspace ID %q", req.WorkspaceId)
	}
	b := req.Body
	if b.Name == "" {
		return nil, invalidInput("name is required")
	}
	visibility := string(VisibilityPrivate)
	if b.Visibility != nil {
		if !b.Visibility.Valid() {
			return nil, invalidInput("invalid visibility %q", *b.Visibility)
		}
		visibility = string(*b.Visibility)
	}

	prj, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  wid,
		Visualizer:   visualizer.VisualizerCesium,
		Name:         &b.Name,
		Description:  b.Description,
		CoreSupport:  lo.ToPtr(true),
		Visibility:   &visibility,
		ImportStatus: project.ProjectImportStatusNone,
		ProjectAlias: b.Alias,
	}, op)
	if err != nil {
		return nil, err
	}

	if err := createSceneAndStory(ctx, uc, prj.ID(), op); err != nil {
		// Do not leave a project behind that the editor cannot open.
		if derr := uc.Project.Delete(ctx, prj.ID(), op); derr != nil {
			log.Errorfc(ctx, "api v1: could not remove project %s after a failed create: %v", prj.ID(), derr)
		}
		return nil, err
	}

	res, err := toProjectWithScene(ctx, uc, prj)
	if err != nil {
		return nil, err
	}
	return CreateProject201JSONResponse(res), nil
}

func createSceneAndStory(ctx context.Context, uc *interfaces.Container, pid id.ProjectID, op *usecase.Operator) error {
	sc, err := uc.Scene.Create(ctx, pid, true, op)
	if err != nil {
		return err
	}
	story, err := uc.StoryTelling.Create(ctx, interfaces.CreateStoryInput{
		SceneID: sc.ID(),
		Title:   defaultStoryTitle,
		Index:   lo.ToPtr(0),
	}, op)
	if err != nil {
		return err
	}
	_, _, err = uc.StoryTelling.CreatePage(ctx, interfaces.CreatePageParam{
		SceneID: sc.ID(),
		StoryID: story.Id(),
	}, op)
	return err
}

func (Server) GetProject(ctx context.Context, req GetProjectRequestObject) (GetProjectResponseObject, error) {
	uc, _ := usecases(ctx)
	pid, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, invalidInput("invalid project ID %q", req.ProjectId)
	}
	prj, err := fetchProject(ctx, uc, pid)
	if err != nil {
		return nil, err
	}
	res, err := toProjectWithScene(ctx, uc, prj)
	if err != nil {
		return nil, err
	}
	return GetProject200JSONResponse(res), nil
}

func (Server) UpdateProject(ctx context.Context, req UpdateProjectRequestObject) (UpdateProjectResponseObject, error) {
	uc, op := usecases(ctx)
	pid, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, invalidInput("invalid project ID %q", req.ProjectId)
	}
	b := req.Body
	if b.Name != nil && *b.Name == "" {
		return nil, invalidInput("name cannot be empty")
	}
	// Answer 404, not 403, for projects the user cannot read.
	if _, err := fetchProject(ctx, uc, pid); err != nil {
		return nil, err
	}

	prj, err := uc.Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:          pid,
		Name:        b.Name,
		Description: b.Description,
		Starred:     b.Starred,
		Archived:    b.Archived,
	}, op)
	if err != nil {
		return nil, err
	}
	res, err := toProjectWithScene(ctx, uc, prj)
	if err != nil {
		return nil, err
	}
	return UpdateProject200JSONResponse(res), nil
}

// DeleteProject moves the project to the trash, or with permanent=true deletes
// a project that is already there. Requiring the trash first means a single
// mistaken call can never destroy a project.
func (Server) DeleteProject(ctx context.Context, req DeleteProjectRequestObject) (DeleteProjectResponseObject, error) {
	uc, op := usecases(ctx)
	pid, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, invalidInput("invalid project ID %q", req.ProjectId)
	}
	prj, err := fetchProject(ctx, uc, pid)
	if err != nil {
		return nil, err
	}

	if lo.FromPtr(req.Params.Permanent) {
		if !prj.IsDeleted() {
			return nil, conflict("project %s is not in the trash; delete it without permanent=true first", pid)
		}
		if err := uc.Project.Delete(ctx, pid, op); err != nil {
			return nil, err
		}
		return DeleteProject204Response{}, nil
	}

	if !prj.IsDeleted() {
		if _, err := uc.Project.Update(ctx, interfaces.UpdateProjectParam{
			ID:      pid,
			Deleted: lo.ToPtr(true),
		}, op); err != nil {
			return nil, err
		}
	}
	return DeleteProject204Response{}, nil
}

// fetchProject returns the project, or a not found error when it does not
// exist or the user cannot read its workspace.
func fetchProject(ctx context.Context, uc *interfaces.Container, pid id.ProjectID) (*project.Project, error) {
	_, op := usecases(ctx)
	res, err := uc.Project.Fetch(ctx, []id.ProjectID{pid}, op)
	if err != nil {
		if apperr.Classify(err) == apperr.ClassNotFound || errors.Is(err, interfaces.ErrOperationDenied) {
			return nil, notFound("project")
		}
		return nil, err
	}
	if len(res) == 0 || res[0] == nil {
		return nil, notFound("project")
	}
	return res[0], nil
}

func toProjectWithScene(ctx context.Context, uc *interfaces.Container, p *project.Project) (Project, error) {
	_, op := usecases(ctx)
	sc, err := uc.Scene.FindByProject(ctx, p.ID(), op)
	if err != nil && apperr.Classify(err) != apperr.ClassNotFound {
		return Project{}, err
	}
	if sc == nil {
		return toProject(p, nil), nil
	}
	return toProject(p, lo.ToPtr(sc.ID())), nil
}

// toProjectsWithScenes converts a page of projects, looking up their scenes
// in one query.
func toProjectsWithScenes(ctx context.Context, uc *interfaces.Container, ps []*project.Project) ([]Project, error) {
	_, op := usecases(ctx)
	ps = lo.Compact(ps)
	scenes, _, err := uc.Scene.FindByProjectsWithStory(ctx, lo.Map(ps, func(p *project.Project, _ int) id.ProjectID {
		return p.ID()
	}), op)
	if err != nil {
		return nil, err
	}
	byProject := make(map[id.ProjectID]id.SceneID, len(scenes))
	for _, sc := range scenes {
		if sc != nil {
			byProject[sc.Project()] = sc.ID()
		}
	}
	res := make([]Project, 0, len(ps))
	for _, p := range ps {
		var sid *id.SceneID
		if s, ok := byProject[p.ID()]; ok {
			sid = &s
		}
		res = append(res, toProject(p, sid))
	}
	return res, nil
}
