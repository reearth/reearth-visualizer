package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *mutationResolver) AddLayerItem(ctx context.Context, input gqlmodel.AddLayerItemInput) (*gqlmodel.AddLayerItemPayload, error) {
	exit := trace(ctx)
	defer exit()

	layer, parent, err := r.usecases.Layer.AddItem(ctx, interfaces.AddLayerItemInput{
		ParentLayerID: id.LayerID(input.ParentLayerID),
		PluginID:      &input.PluginID,
		ExtensionID:   &input.ExtensionID,
		Index:         input.Index,
		Name:          gqlmodel.RefToString(input.Name),
		LatLng:        gqlmodel.ToPropertyLatLng(input.Lat, input.Lng),
		// LinkedDatasetID: input.LinkedDatasetID,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddLayerItemPayload{
		Layer:       gqlmodel.ToLayerItem(layer, parent.IDRef()),
		ParentLayer: gqlmodel.ToLayerGroup(parent, nil),
		Index:       input.Index,
	}, nil
}

func (r *mutationResolver) AddLayerGroup(ctx context.Context, input gqlmodel.AddLayerGroupInput) (*gqlmodel.AddLayerGroupPayload, error) {
	exit := trace(ctx)
	defer exit()

	layer, parent, err := r.usecases.Layer.AddGroup(ctx, interfaces.AddLayerGroupInput{
		ParentLayerID:         id.LayerID(input.ParentLayerID),
		PluginID:              input.PluginID,
		ExtensionID:           input.ExtensionID,
		Index:                 input.Index,
		Name:                  gqlmodel.RefToString(input.Name),
		LinkedDatasetSchemaID: id.DatasetSchemaIDFromRefID(input.LinkedDatasetSchemaID),
		RepresentativeFieldId: input.RepresentativeFieldID,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddLayerGroupPayload{
		Layer:       gqlmodel.ToLayerGroup(layer, parent.IDRef()),
		ParentLayer: gqlmodel.ToLayerGroup(parent, nil),
		Index:       input.Index,
	}, nil
}

func (r *mutationResolver) RemoveLayer(ctx context.Context, input gqlmodel.RemoveLayerInput) (*gqlmodel.RemoveLayerPayload, error) {
	exit := trace(ctx)
	defer exit()

	id, layer, err := r.usecases.Layer.Remove(ctx, id.LayerID(input.LayerID), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveLayerPayload{
		LayerID:     id.ID(),
		ParentLayer: gqlmodel.ToLayerGroup(layer, nil),
	}, nil
}

func (r *mutationResolver) UpdateLayer(ctx context.Context, input gqlmodel.UpdateLayerInput) (*gqlmodel.UpdateLayerPayload, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := r.usecases.Layer.Update(ctx, interfaces.UpdateLayerInput{
		LayerID: id.LayerID(input.LayerID),
		Name:    input.Name,
		Visible: input.Visible,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateLayerPayload{
		Layer: gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) MoveLayer(ctx context.Context, input gqlmodel.MoveLayerInput) (*gqlmodel.MoveLayerPayload, error) {
	exit := trace(ctx)
	defer exit()

	targetLayerID, layerGroupFrom, layerGroupTo, index, err := r.usecases.Layer.Move(ctx, interfaces.MoveLayerInput{
		LayerID:     id.LayerID(input.LayerID),
		DestLayerID: id.LayerIDFromRefID(input.DestLayerID),
		Index:       gqlmodel.RefToIndex(input.Index),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.MoveLayerPayload{
		LayerID:         targetLayerID.ID(),
		FromParentLayer: gqlmodel.ToLayerGroup(layerGroupFrom, nil),
		ToParentLayer:   gqlmodel.ToLayerGroup(layerGroupTo, nil),
		Index:           index,
	}, nil
}

func (r *mutationResolver) CreateInfobox(ctx context.Context, input gqlmodel.CreateInfoboxInput) (*gqlmodel.CreateInfoboxPayload, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := r.usecases.Layer.CreateInfobox(ctx, id.LayerID(input.LayerID), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateInfoboxPayload{
		Layer: gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) RemoveInfobox(ctx context.Context, input gqlmodel.RemoveInfoboxInput) (*gqlmodel.RemoveInfoboxPayload, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := r.usecases.Layer.RemoveInfobox(ctx, id.LayerID(input.LayerID), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveInfoboxPayload{
		Layer: gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) AddInfoboxField(ctx context.Context, input gqlmodel.AddInfoboxFieldInput) (*gqlmodel.AddInfoboxFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	infoboxField, layer, err := r.usecases.Layer.AddInfoboxField(ctx, interfaces.AddInfoboxFieldParam{
		LayerID:     id.LayerID(input.LayerID),
		PluginID:    input.PluginID,
		ExtensionID: input.ExtensionID,
		Index:       input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddInfoboxFieldPayload{
		InfoboxField: gqlmodel.ToInfoboxField(infoboxField, layer.Scene(), nil),
		Layer:        gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) MoveInfoboxField(ctx context.Context, input gqlmodel.MoveInfoboxFieldInput) (*gqlmodel.MoveInfoboxFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	infoboxField, layer, index, err := r.usecases.Layer.MoveInfoboxField(ctx, interfaces.MoveInfoboxFieldParam{
		LayerID:        id.LayerID(input.LayerID),
		InfoboxFieldID: id.InfoboxFieldID(input.InfoboxFieldID),
		Index:          input.Index,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.MoveInfoboxFieldPayload{
		InfoboxFieldID: infoboxField.ID(),
		Layer:          gqlmodel.ToLayer(layer, nil),
		Index:          index,
	}, nil
}

func (r *mutationResolver) RemoveInfoboxField(ctx context.Context, input gqlmodel.RemoveInfoboxFieldInput) (*gqlmodel.RemoveInfoboxFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	infoboxField, layer, err := r.usecases.Layer.RemoveInfoboxField(ctx, interfaces.RemoveInfoboxFieldParam{
		LayerID:        id.LayerID(input.LayerID),
		InfoboxFieldID: id.InfoboxFieldID(input.InfoboxFieldID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveInfoboxFieldPayload{
		InfoboxFieldID: infoboxField.ID(),
		Layer:          gqlmodel.ToLayer(layer, nil),
	}, nil
}

func (r *mutationResolver) ImportLayer(ctx context.Context, input gqlmodel.ImportLayerInput) (*gqlmodel.ImportLayerPayload, error) {
	exit := trace(ctx)
	defer exit()

	l, l2, err := r.usecases.Layer.ImportLayer(ctx, interfaces.ImportLayerParam{
		LayerID: id.LayerID(input.LayerID),
		File:    gqlmodel.FromFile(&input.File),
		Format:  gqlmodel.FromLayerEncodingFormat(input.Format),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ImportLayerPayload{
		Layers:      gqlmodel.ToLayers(l, l2.IDRef()),
		ParentLayer: gqlmodel.ToLayerGroup(l2, nil),
	}, err
}
