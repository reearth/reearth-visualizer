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

func (r *mutationResolver) DuplicateNLSLayer(ctx context.Context, input gqlmodel.DuplicateNLSLayerInput) (*gqlmodel.DuplicateNLSLayerPayload, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).NLSLayer.Duplicate(ctx, lid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DuplicateNLSLayerPayload{
		Layer: gqlmodel.ToNLSLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) CreateNLSInfobox(ctx context.Context, input gqlmodel.CreateNLSInfoboxInput) (*gqlmodel.CreateNLSInfoboxPayload, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).NLSLayer.CreateNLSInfobox(ctx, lid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateNLSInfoboxPayload{
		Layer: gqlmodel.ToNLSLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) RemoveNLSInfobox(ctx context.Context, input gqlmodel.RemoveNLSInfoboxInput) (*gqlmodel.RemoveNLSInfoboxPayload, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	layer, err := usecases(ctx).NLSLayer.RemoveNLSInfobox(ctx, lid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveNLSInfoboxPayload{
		Layer: gqlmodel.ToNLSLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) AddNLSInfoboxBlock(ctx context.Context, input gqlmodel.AddNLSInfoboxBlockInput) (*gqlmodel.AddNLSInfoboxBlockPayload, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	pid, err := gqlmodel.ToPluginID(input.PluginID)
	if err != nil {
		return nil, err
	}

	infoboxBlock, layer, err := usecases(ctx).NLSLayer.AddNLSInfoboxBlock(ctx, interfaces.AddNLSInfoboxBlockParam{
		LayerID:     lid,
		Index:       input.Index,
		PluginID:    pid,
		ExtensionID: id.PluginExtensionID(input.ExtensionID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddNLSInfoboxBlockPayload{
		InfoboxBlock: gqlmodel.ToNLSInfoboxBlock(infoboxBlock, layer.Scene()),
		Layer:        gqlmodel.ToNLSLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) MoveNLSInfoboxBlock(ctx context.Context, input gqlmodel.MoveNLSInfoboxBlockInput) (*gqlmodel.MoveNLSInfoboxBlockPayload, error) {
	lid, ifid, err := gqlmodel.ToID2[id.NLSLayer, id.InfoboxBlock](input.LayerID, input.InfoboxBlockID)
	if err != nil {
		return nil, err
	}

	infoboxBlock, layer, index, err := usecases(ctx).NLSLayer.MoveNLSInfoboxBlock(ctx, interfaces.MoveNLSInfoboxBlockParam{
		LayerID:        lid,
		InfoboxBlockID: ifid,
		Index:          input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.MoveNLSInfoboxBlockPayload{
		InfoboxBlockID: gqlmodel.IDFrom(infoboxBlock),
		Layer:          gqlmodel.ToNLSLayer(layer, nil),
		Index:          index,
	}, nil
}

func (r *mutationResolver) RemoveNLSInfoboxBlock(ctx context.Context, input gqlmodel.RemoveNLSInfoboxBlockInput) (*gqlmodel.RemoveNLSInfoboxBlockPayload, error) {
	lid, ibid, err := gqlmodel.ToID2[id.NLSLayer, id.InfoboxBlock](input.LayerID, input.InfoboxBlockID)
	if err != nil {
		return nil, err
	}

	infoboxBlock, layer, err := usecases(ctx).NLSLayer.RemoveNLSInfoboxBlock(ctx, interfaces.RemoveNLSInfoboxBlockParam{
		LayerID:        lid,
		InfoboxBlockID: ibid,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveNLSInfoboxBlockPayload{
		InfoboxBlockID: gqlmodel.IDFrom(infoboxBlock),
		Layer:          gqlmodel.ToNLSLayer(layer, nil),
	}, nil
}
