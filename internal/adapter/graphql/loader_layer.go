package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (c *LayerController) Fetch(ctx context.Context, ids []id.LayerID, operator *usecase.Operator) ([]*Layer, []error) {
	res, err := c.usecase().Fetch(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	layers := make([]*Layer, 0, len(res))
	for _, l := range res {
		if l == nil {
			layers = append(layers, nil)
		} else {
			layer := toLayer(*l, nil)
			layers = append(layers, &layer)
		}
	}

	return layers, nil
}

func (c *LayerController) FetchGroup(ctx context.Context, ids []id.LayerID, operator *usecase.Operator) ([]*LayerGroup, []error) {
	res, err := c.usecase().FetchGroup(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	layerGroups := make([]*LayerGroup, 0, len(res))
	for _, l := range res {
		layerGroups = append(layerGroups, toLayerGroup(l, nil))
	}

	return layerGroups, nil
}

func (c *LayerController) FetchItem(ctx context.Context, ids []id.LayerID, operator *usecase.Operator) ([]*LayerItem, []error) {
	res, err := c.usecase().FetchItem(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	layerItems := make([]*LayerItem, 0, len(res))
	for _, l := range res {
		layerItems = append(layerItems, toLayerItem(l, nil))
	}

	return layerItems, nil
}

func (c *LayerController) FetchParent(ctx context.Context, lid id.LayerID, operator *usecase.Operator) (*LayerGroup, error) {
	res, err := c.usecase().FetchParent(ctx, id.LayerID(lid), operator)
	if err != nil {
		return nil, err
	}

	return toLayerGroup(res, nil), nil
}

func (c *LayerController) FetchByProperty(ctx context.Context, pid id.PropertyID, operator *usecase.Operator) (Layer, error) {
	res, err := c.usecase().FetchByProperty(ctx, pid, operator)
	if err != nil {
		return nil, err
	}

	return toLayer(res, nil), nil
}

func (c *LayerController) FetchMerged(ctx context.Context, org id.LayerID, parent *id.LayerID, operator *usecase.Operator) (*MergedLayer, error) {
	res, err2 := c.usecase().FetchMerged(ctx, org, parent, operator)
	if err2 != nil {
		return nil, err2
	}

	return toMergedLayer(res), nil
}

func (c *LayerController) FetchParentAndMerged(ctx context.Context, org id.LayerID, operator *usecase.Operator) (*MergedLayer, error) {
	res, err2 := c.usecase().FetchParentAndMerged(ctx, org, operator)
	if err2 != nil {
		return nil, err2
	}

	return toMergedLayer(res), nil
}
