package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
)

func (r *mutationResolver) AddNLSLayerSimple(ctx context.Context, input gqlmodel.AddNLSLayerSimpleInput) (*gqlmodel.AddNLSLayerSimplePayload, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.ParentLayerID)
	if err != nil {
		return nil, err
	}

	layer, parent, err := usecases(ctx).NLSLayer.AddLayerSimple(ctx, interfaces.AddNLSLayerSimpleInput{
		ParentLayerID: lid,
		Index:       input.Index,
		LayerType:   input.LayerType,
		Data:		 gqlmodel.ToNLSLayerData(input.DataType, input.TimeProperty, input.CSVIDColumn, input.CSVLatColumn, input.CSVLngColumn, input.CSVHeightColumn, input.DataJSONProperties, input.DataUpdateInterval, input.TimeInterval, input.DataLayers, input.DataParameters, input.DataValue, input.CSVDisableTypeConversion, input.CSVNoHeader, input.TimeUpdateClockOnLoad, input.DataURL),
		Properties:  gqlmodel.ToNLSProperties(input.Properties),
		Defines: gqlmodel.ToNLSDefines(input.Defines),
		Events: gqlmodel.ToNLSEvents(input.Events),
		Appearance: gqlmodel.ToNLSApperance(input.Appearance),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddNLSLayerSimplePayload{
		Layers:       gqlmodel.ToNLSLayerSimple(layer, parent.IDRef()),
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
		LayerID:     gqlmodel.IDFrom(id),

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
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateNLSLayerPayload{
		Layer: gqlmodel.ToNLSLayer(layer, nil),
	}, nil
}
