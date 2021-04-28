package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (c *TeamController) Fetch(ctx context.Context, ids []id.TeamID, operator *usecase.Operator) ([]*Team, []error) {
	res, err := c.usecase().Fetch(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	teams := make([]*Team, 0, len(res))
	for _, t := range res {
		teams = append(teams, toTeam(t))
	}
	return teams, nil
}

func (c *TeamController) FindByUser(ctx context.Context, uid id.UserID, operator *usecase.Operator) ([]*Team, error) {
	res, err := c.usecase().FindByUser(ctx, uid, operator)
	if err != nil {
		return nil, err
	}
	teams := make([]*Team, 0, len(res))
	for _, t := range res {
		teams = append(teams, toTeam(t))
	}
	return teams, nil
}
