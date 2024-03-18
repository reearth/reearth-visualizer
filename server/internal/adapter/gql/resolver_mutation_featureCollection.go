package gql

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
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

	featureGeometry, err := convertGeometry(res.Geometry())
	if err != nil {
		return nil, err
	}

	return &gqlmodel.Feature{
		ID:         gqlmodel.IDFrom(res.ID()),
		Type:       res.FeatureType(),
		Geometry:   featureGeometry,
		Properties: res.Properties(),
	}, nil
}

func (r *mutationResolver) UpdateGeoJSONFeature(ctx context.Context, input gqlmodel.UpdateGeoJSONFeatureInput) (*gqlmodel.Feature, error) {
	return &gqlmodel.Feature{}, nil
}

func (r *mutationResolver) DeleteGeoJSONFeature(ctx context.Context, input gqlmodel.DeleteGeoJSONFeatureInput) (*gqlmodel.DeleteGeoJSONFeaturePayload, error) {
	return &gqlmodel.DeleteGeoJSONFeaturePayload{
		DeletedFeatureID: "",
	}, nil
}

func convertGeometry(nlslayerGeom nlslayer.Geometry) (gqlmodel.Geometry, error) {
	switch geom := nlslayerGeom.(type) {
	case *nlslayer.Point:
		return gqlmodel.Point{
			Type:             geom.Type,
			PointCoordinates: geom.CoordinatesVal,
		}, nil
	case *nlslayer.LineString:
		return gqlmodel.LineString{
			Type:                  geom.Type,
			LineStringCoordinates: geom.CoordinatesVal,
		}, nil
	case *nlslayer.Polygon:
		return gqlmodel.Polygon{
			Type:               geom.Type,
			PolygonCoordinates: geom.CoordinatesVal,
		}, nil
	case *nlslayer.MultiPolygon:
		return gqlmodel.MultiPolygon{
			Type:                    geom.Type,
			MultiPolygonCoordinates: geom.CoordinatesVal,
		}, nil
	case *nlslayer.GeometryCollection:
		var geometries []gqlmodel.Geometry
		for _, g := range geom.GeometriesVal {
			convertedGeom, err := convertGeometry(g)
			if err != nil {
				return nil, err
			}
			geometries = append(geometries, convertedGeom)
		}
		return gqlmodel.GeometryCollection{
			Type:       geom.Type,
			Geometries: geometries,
		}, nil
	default:
		return nil, fmt.Errorf("unsupported geometry type: %T", nlslayerGeom)
	}
}
