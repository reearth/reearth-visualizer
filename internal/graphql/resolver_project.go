package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

func (r *Resolver) Project() ProjectResolver {
	return &projectResolver{r}
}

type projectResolver struct{ *Resolver }

func (r *projectResolver) Team(ctx context.Context, obj *graphql1.Project) (*graphql1.Team, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Team.Load(id.TeamID(obj.TeamID))
}

func (r *projectResolver) Scene(ctx context.Context, obj *graphql1.Project) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	s, err := r.config.Controllers.SceneController.FindByProject(ctx, id.ProjectID(obj.ID), getOperator(ctx))
	if err != nil && err != rerror.ErrNotFound {
		return nil, err
	}
	return s, nil
}
