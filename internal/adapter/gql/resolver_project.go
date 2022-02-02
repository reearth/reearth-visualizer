package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

func (r *Resolver) Project() ProjectResolver {
	return &projectResolver{r}
}

type projectResolver struct{ *Resolver }

func (r *projectResolver) Team(ctx context.Context, obj *gqlmodel.Project) (*gqlmodel.Team, error) {
	return dataloaders(ctx).Team.Load(id.TeamID(obj.TeamID))
}

func (r *projectResolver) Scene(ctx context.Context, obj *gqlmodel.Project) (*gqlmodel.Scene, error) {
	s, err := loaders(ctx).Scene.FindByProject(ctx, id.ProjectID(obj.ID))
	if err != nil && err != rerror.ErrNotFound {
		return nil, err
	}
	return s, nil
}
