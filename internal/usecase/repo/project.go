package repo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/project"
)

type Project interface {
	Filtered(TeamFilter) Project
	FindByIDs(context.Context, []id.ProjectID) ([]*project.Project, error)
	FindByID(context.Context, id.ProjectID) (*project.Project, error)
	FindByTeam(context.Context, id.TeamID, *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error)
	FindByPublicName(context.Context, string) (*project.Project, error)
	CountByTeam(context.Context, id.TeamID) (int, error)
	Save(context.Context, *project.Project) error
	Remove(context.Context, id.ProjectID) error
}

func IterateProjectsByTeam(repo Project, ctx context.Context, tid id.TeamID, batch int, callback func([]*project.Project) error) error {
	pagination := usecase.NewPagination(&batch, nil, nil, nil)

	for {
		projects, info, err := repo.FindByTeam(ctx, tid, pagination)
		if err != nil {
			return err
		}
		if len(projects) == 0 {
			break
		}

		if err := callback(projects); err != nil {
			return err
		}

		if !info.HasNextPage() {
			break
		}

		c := usecase.Cursor(projects[len(projects)-1].ID().String())
		pagination.After = &c
	}

	return nil
}
