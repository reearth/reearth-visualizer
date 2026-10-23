package apiv1

import (
	"context"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

const (
	defaultLimit = 20
	maxLimit     = 100
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
	if starred && deleted {
		return nil, invalidInput("starred and deleted cannot be combined")
	}
	if (starred || deleted) && (p.Keyword != nil || p.Sort != nil) {
		return nil, invalidInput("keyword and sort cannot be combined with starred or deleted")
	}
	// A workspace the user cannot read looks empty, whatever the filter: the
	// starred and deleted lookups would otherwise answer 403 and reveal it.
	if !op.IsReadableWorkspace(wid) {
		return ListProjects200JSONResponse(ProjectList{Items: []Project{}}), nil
	}
	var (
		res []*project.Project
		pi  *usecasex.PageInfo
	)
	switch {
	case starred:
		res, pi, err = uc.Project.FindStarredByWorkspace(ctx, wid, pagination, op)
	case deleted:
		res, pi, err = uc.Project.FindDeletedByWorkspace(ctx, wid, pagination, op)
	default:
		sort, serr := toSortType(p.Sort)
		if serr != nil {
			return nil, serr
		}
		res, pi, err = uc.Project.FindByWorkspace(ctx, wid, p.Keyword, sort, pagination, nil, op)
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

// toProjectsWithScenes converts a page of projects, looking up their scenes
// in one query.
func toProjectsWithScenes(ctx context.Context, uc *interfaces.Container, ps []*project.Project) ([]Project, error) {
	_, op := usecases(ctx)
	ps = lo.Compact(ps)
	scenes, err := uc.Scene.FindByProjects(ctx, lo.Map(ps, func(p *project.Project, _ int) id.ProjectID {
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
