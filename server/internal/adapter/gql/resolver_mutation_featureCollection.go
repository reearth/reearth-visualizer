package gql

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
)

func (r *mutationResolver) AddGeoJSONFeature(ctx context.Context, input gqlmodel.AddGeoJSONFeatureInput) (*gqlmodel.Feature, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	var geometry json.RawMessage
	var properties json.RawMessage

	geometryBytes, err := json.Marshal(input.Geometry)
	if err != nil {
		return nil, err
	}
	geometry = json.RawMessage(geometryBytes)

	propertiesBytes, err := json.Marshal(input.Properties)
	if err != nil {
		return nil, err
	}
	properties = json.RawMessage(propertiesBytes)

	res, err := usecases(ctx).NLSLayer.AddGeoJSONFeature(ctx, interfaces.AddNLSLayerGeoJSONFeatureParams{
		LayerID:    lid,
		Type:       input.Type,
		Geometry:   geometry,
		Properties: properties,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	fmt.Println(res)

	return &gqlmodel.Feature{
		Type: "Type",
		Geometry: gqlmodel.Point{
			Type:             "Point",
			PointCoordinates: []float64{102.0, 0.5},
		},
		ID:         nil,
		Properties: nil,
	}, nil
}

func (r *mutationResolver) UpdateGeoJSONFeature(ctx context.Context, input gqlmodel.UpdateGeoJSONFeatureInput) (*gqlmodel.Feature, error) {
	return &gqlmodel.Feature{
		Type: "Type",
		Geometry: gqlmodel.Point{
			Type:             "Point",
			PointCoordinates: []float64{102.0, 0.5},
		},
		ID:         nil,
		Properties: nil,
	}, nil
}

func (r *mutationResolver) DeleteGeoJSONFeature(ctx context.Context, input gqlmodel.DeleteGeoJSONFeatureInput) (*gqlmodel.DeleteGeoJSONFeaturePayload, error) {
	return &gqlmodel.DeleteGeoJSONFeaturePayload{
		DeletedFeatureID: "",
	}, nil
}
