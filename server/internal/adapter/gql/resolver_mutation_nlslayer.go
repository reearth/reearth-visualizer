package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
)

func (r *mutationResolver) AddNLSLayerSimple(ctx context.Context, input gqlmodel.AddNLSLayerSimpleInput) (*gqlmodel.AddNLSLayerSimplePayload, error) {

	sId, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	inp := interfaces.AddNLSLayerSimpleInput{
		SceneID:   sId,
		Title:     input.Title,
		Index:     input.Index,
		LayerType: gqlmodel.ToNLSLayerType(input.LayerType),
		Config:    gqlmodel.ToNLSConfig(input.Config),
		Visible:   input.Visible,
	}

	layer, err := usecases(ctx).NLSLayer.AddLayerSimple(ctx, inp, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddNLSLayerSimplePayload{
		Layers: gqlmodel.ToNLSLayerSimple(layer),
	}, nil
}

func (r *mutationResolver) RemoveNLSLayer(ctx context.Context, input gqlmodel.RemoveNLSLayerInput) (*gqlmodel.RemoveNLSLayerPayload, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	id, _, err := usecases(ctx).NLSLayer.Remove(ctx, lid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveNLSLayerPayload{
		LayerID: gqlmodel.IDFrom(id),
	}, nil
}

func (r *mutationResolver) UpdateNLSLayer(ctx context.Context, input gqlmodel.UpdateNLSLayerInput) (*gqlmodel.UpdateNLSLayerPayload, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).NLSLayer.Update(ctx, interfaces.UpdateNLSLayerInput{
		LayerID: lid,
		Name:    input.Name,
		Visible: input.Visible,
		Config:  gqlmodel.ToNLSConfig(input.Config),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateNLSLayerPayload{
		Layer: gqlmodel.ToNLSLayer(layer, nil),
	}, nil
}
