package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/util"
)

type TeamLoader struct {
	usecase interfaces.Team
}

func NewTeamLoader(usecase interfaces.Team) *TeamLoader {
	return &TeamLoader{usecase: usecase}
}

func (c *TeamLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Team, []error) {
	uids, err := util.TryMap(ids, gqlmodel.ToID[id.Team])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, uids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	teams := make([]*gqlmodel.Team, 0, len(res))
	for _, t := range res {
		teams = append(teams, gqlmodel.ToTeam(t))
	}
	return teams, nil
}

func (c *TeamLoader) FindByUser(ctx context.Context, uid gqlmodel.ID) ([]*gqlmodel.Team, error) {
	userid, err := gqlmodel.ToID[id.User](uid)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindByUser(ctx, userid, getOperator(ctx))
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
	Load(gqlmodel.ID) (*gqlmodel.Team, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Team, []error)
}

func (c *TeamLoader) DataLoader(ctx context.Context) TeamDataLoader {
	return gqldataloader.NewTeamLoader(gqldataloader.TeamLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Team, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *TeamLoader) OrdinaryDataLoader(ctx context.Context) TeamDataLoader {
	return &ordinaryTeamLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Team, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryTeamLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Team, []error)
}

func (l *ordinaryTeamLoader) Load(key gqlmodel.ID) (*gqlmodel.Team, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryTeamLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Team, []error) {
	return l.fetch(keys)
}
