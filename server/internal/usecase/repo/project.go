package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type ProjectFilter struct {
	Sort        *project.SortType
	Keyword     *string
	Pagination  *usecasex.Pagination
	Limit       *int64
	Offset      *int64
	SearchField *string
	Visibility  *string
	Topics      []string
}

type Project interface {
	Filtered(WorkspaceFilter) Project
	FindByIDs(context.Context, id.ProjectIDList) ([]*project.Project, error)
	FindByID(context.Context, id.ProjectID) (*project.Project, error)
	FindByScene(context.Context, id.SceneID) (*project.Project, error)
	FindByWorkspace(context.Context, accountsID.WorkspaceID, ProjectFilter) ([]*project.Project, *usecasex.PageInfo, error)
	FindByWorkspaces(context.Context, bool, ProjectFilter, []string, []string, []string) ([]*project.Project, *usecasex.PageInfo, error)
	FindStarredByWorkspace(context.Context, accountsID.WorkspaceID) ([]*project.Project, error)
	FindDeletedByWorkspace(context.Context, accountsID.WorkspaceID) ([]*project.Project, error)
	FindActiveById(context.Context, id.ProjectID) (*project.Project, error)
	FindActiveByAlias(context.Context, string) (*project.Project, error)
	FindByProjectAlias(context.Context, string) (*project.Project, error)
	FindByPublicName(context.Context, string) (*project.Project, error)
	FindAll(context.Context, ProjectFilter) ([]*project.Project, *usecasex.PageInfo, error)
	CheckProjectAliasUnique(context.Context, accountsID.WorkspaceID, string, *id.ProjectID) error
	CheckSceneAliasUnique(context.Context, string) error
	CountByWorkspace(context.Context, accountsID.WorkspaceID) (int, error)
	CountPublicByWorkspace(context.Context, accountsID.WorkspaceID) (int, error)
	Save(context.Context, *project.Project) error
	Remove(context.Context, id.ProjectID) error
}

func IterateProjectsByWorkspace(repo Project, ctx context.Context, tid accountsID.WorkspaceID, batch int64, callback func([]*project.Project) error) error {
	pagination := usecasex.CursorPagination{
		Before: nil,
		After:  nil,
		First:  lo.ToPtr(batch),
		Last:   nil,
	}.Wrap()

	filter := ProjectFilter{
		Pagination: pagination,
	}

	for {
		projects, info, err := repo.FindByWorkspace(ctx, tid, filter)
		if err != nil {
			return err
		}
		if len(projects) == 0 {
			break
		}

		if err := callback(projects); err != nil {
			return err
		}

		if !info.HasNextPage {
			break
		}

		c := usecasex.Cursor(projects[len(projects)-1].ID().String())
		pagination.Cursor.After = &c
	}

	return nil
}
