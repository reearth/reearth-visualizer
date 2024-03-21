package gql

import (
	"context"
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

	res, err := usecases(ctx).NLSLayer.AddGeoJSONFeature(ctx, interfaces.AddNLSLayerGeoJSONFeatureParams{
		LayerID:    lid,
		Type:       input.Type,
		Geometry:   input.Geometry,
		Properties: gqlmodel.ToGoJsonRef(input.Properties),
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
		Properties: gqlmodel.JSON(*res.Properties()),
	}, nil
}

func (r *mutationResolver) UpdateGeoJSONFeature(ctx context.Context, input gqlmodel.UpdateGeoJSONFeatureInput) (*gqlmodel.Feature, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	fid, err := gqlmodel.ToID[id.Feature](input.FeatureID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).NLSLayer.UpdateGeoJSONFeature(ctx, interfaces.UpdateNLSLayerGeoJSONFeatureParams{
		LayerID:    lid,
		FeatureID:  fid,
		Geometry:   gqlmodel.ToGoJsonRef(input.Geometry),
		Properties: gqlmodel.ToGoJsonRef(input.Properties),
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
		Properties: gqlmodel.JSON(*res.Properties()),
	}, nil
}

func (r *mutationResolver) DeleteGeoJSONFeature(ctx context.Context, input gqlmodel.DeleteGeoJSONFeatureInput) (*gqlmodel.DeleteGeoJSONFeaturePayload, error) {
	lid, err := gqlmodel.ToID[id.NLSLayer](input.LayerID)
	if err != nil {
		return nil, err
	}

	fid, err := gqlmodel.ToID[id.Feature](input.FeatureID)
	if err != nil {
		return nil, err
	}

	id, err := usecases(ctx).NLSLayer.DeleteGeoJSONFeature(ctx, interfaces.DeleteNLSLayerGeoJSONFeatureParams{
		LayerID:   lid,
		FeatureID: fid,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteGeoJSONFeaturePayload{
		DeletedFeatureID: gqlmodel.IDFrom(id),
	}, nil
}

func convertGeometry(nlslayerGeom nlslayer.Geometry) (gqlmodel.Geometry, error) {
	switch geom := nlslayerGeom.(type) {
	case *nlslayer.Point:
		return gqlmodel.Point{
			Type:             geom.PointType(),
			PointCoordinates: geom.Coordinates(),
		}, nil
	case *nlslayer.LineString:
		return gqlmodel.LineString{
			Type:                  geom.LineStringType(),
			LineStringCoordinates: geom.Coordinates(),
		}, nil
	case *nlslayer.Polygon:
		return gqlmodel.Polygon{
			Type:               geom.PolygonType(),
			PolygonCoordinates: geom.Coordinates(),
		}, nil
	case *nlslayer.MultiPolygon:
		return gqlmodel.MultiPolygon{
			Type:                    geom.MultiPolygonType(),
			MultiPolygonCoordinates: geom.Coordinates(),
		}, nil
	case *nlslayer.GeometryCollection:
		var geometries []gqlmodel.Geometry
		for _, g := range geom.Geometries() {
			convertedGeom, err := convertGeometry(g)
			if err != nil {
				return nil, err
			}
			geometries = append(geometries, convertedGeom)
		}
		return gqlmodel.GeometryCollection{
			Type:       geom.GeometryCollectionType(),
			Geometries: geometries,
		}, nil
	default:
		return nil, fmt.Errorf("unsupported geometry type: %T", nlslayerGeom)
	}
}
