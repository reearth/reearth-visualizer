package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type TeamLoader struct {
	usecase interfaces.Team
}

func NewTeamLoader(usecase interfaces.Team) *TeamLoader {
	return &TeamLoader{usecase: usecase}
}

func (c *TeamLoader) Fetch(ctx context.Context, ids []id.TeamID) ([]*gqlmodel.Team, []error) {
	res, err := c.usecase.Fetch(ctx, ids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	teams := make([]*gqlmodel.Team, 0, len(res))
	for _, t := range res {
		teams = append(teams, gqlmodel.ToTeam(t))
	}
	return teams, nil
}

func (c *TeamLoader) FindByUser(ctx context.Context, uid id.UserID) ([]*gqlmodel.Team, error) {
	res, err := c.usecase.FindByUser(ctx, uid, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	teams := make([]*gqlmodel.Team, 0, len(res))
	for _, t := range res {
		teams = append(teams, gqlmodel.ToTeam(t))
	}
	return teams, nil
}

// data loader

type TeamDataLoader interface {
	Load(id.TeamID) (*gqlmodel.Team, error)
	LoadAll([]id.TeamID) ([]*gqlmodel.Team, []error)
}

func (c *TeamLoader) DataLoader(ctx context.Context) TeamDataLoader {
	return gqldataloader.NewTeamLoader(gqldataloader.TeamLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []id.TeamID) ([]*gqlmodel.Team, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *TeamLoader) OrdinaryDataLoader(ctx context.Context) TeamDataLoader {
	return &ordinaryTeamLoader{
		fetch: func(keys []id.TeamID) ([]*gqlmodel.Team, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryTeamLoader struct {
	fetch func(keys []id.TeamID) ([]*gqlmodel.Team, []error)
}

func (l *ordinaryTeamLoader) Load(key id.TeamID) (*gqlmodel.Team, error) {
	res, errs := l.fetch([]id.TeamID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryTeamLoader) LoadAll(keys []id.TeamID) ([]*gqlmodel.Team, []error) {
	return l.fetch(keys)
}
