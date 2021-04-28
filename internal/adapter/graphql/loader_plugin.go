package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (c *PluginController) Fetch(ctx context.Context, ids []id.PluginID, operator *usecase.Operator) ([]*Plugin, []error) {
	res, err := c.usecase().Fetch(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	plugins := make([]*Plugin, 0, len(res))
	for _, pl := range res {
		plugins = append(plugins, toPlugin(pl))
	}

	return plugins, nil
}
