package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/stretchr/testify/assert"
)

func TestToNLSLayerSketchInfo(t *testing.T) {
	feature1, err := nlslayer.NewFeatureWithNewId(
		"Feature",
		nlslayer.NewPoint("Point", []float64{1, 2}),
	)
	if err != nil {
		t.Fatal(err)
	}
	feature1.UpdateProperties(&map[string]any{"key1": "value1"})

	feature2, err := nlslayer.NewFeatureWithNewId(
		"Feature",
		nlslayer.NewLineString("LineString", [][]float64{{1, 2}, {3, 4}}),
	)
	if err != nil {
		t.Fatal(err)
	}
	feature2.UpdateProperties(&map[string]any{"key2": "value2"})

	feature3, err := nlslayer.NewFeatureWithNewId(
		"Feature",
		nlslayer.NewPolygon("Polygon", [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}),
	)
	if err != nil {
		t.Fatal(err)
	}
	feature3.UpdateProperties(&map[string]any{"key3": "value3"})

	feature4, err := nlslayer.NewFeatureWithNewId(
		"Feature",
		nlslayer.NewMultiPolygon("MultiPolygon", [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}}),
	)
	if err != nil {
		t.Fatal(err)
	}
	feature4.UpdateProperties(&map[string]any{"key4": "value4"})

	feature5, err := nlslayer.NewFeatureWithNewId(
		"Feature",
		nlslayer.NewGeometryCollection(
			"GeometryCollection",
			[]nlslayer.Geometry{feature1.Geometry(), feature2.Geometry(), feature3.Geometry(), feature4.Geometry()},
		),
	)
	if err != nil {
		t.Fatal(err)
	}
	feature5.UpdateProperties(&map[string]any{"key5": "value5"})

	features := []nlslayer.Feature{*feature1, *feature2, *feature3, *feature4, *feature5}
	featureCollection := nlslayer.NewFeatureCollection("FeatureCollection", features)

	expectedFeatureCollection := &FeatureCollection{
		Type: "FeatureCollection",
		Features: []*Feature{
			{
				ID:   IDFrom(feature1.ID()),
				Type: feature1.FeatureType(),
				Geometry: Point{
					Type:             feature1.Geometry().(*nlslayer.Point).PointType(),
					PointCoordinates: feature1.Geometry().(*nlslayer.Point).Coordinates(),
				},
				Properties: *feature1.Properties(),
			},
			{
				ID:   IDFrom(feature2.ID()),
				Type: feature2.FeatureType(),
				Geometry: LineString{
					Type:                  feature2.Geometry().(*nlslayer.LineString).LineStringType(),
					LineStringCoordinates: feature2.Geometry().(*nlslayer.LineString).Coordinates(),
				},
				Properties: *feature2.Properties(),
			},
			{
				ID:   IDFrom(feature3.ID()),
				Type: feature3.FeatureType(),
				Geometry: Polygon{
					Type:               feature3.Geometry().(*nlslayer.Polygon).PolygonType(),
					PolygonCoordinates: feature3.Geometry().(*nlslayer.Polygon).Coordinates(),
				},
				Properties: *feature3.Properties(),
			},
			{
				ID:   IDFrom(feature4.ID()),
				Type: feature4.FeatureType(),
				Geometry: MultiPolygon{
					Type:                    feature4.Geometry().(*nlslayer.MultiPolygon).MultiPolygonType(),
					MultiPolygonCoordinates: feature4.Geometry().(*nlslayer.MultiPolygon).Coordinates(),
				},
				Properties: *feature4.Properties(),
			},
			{
				ID:   IDFrom(feature5.ID()),
				Type: feature5.FeatureType(),
				Geometry: GeometryCollection{
					Type: feature5.Geometry().(*nlslayer.GeometryCollection).GeometryCollectionType(),
					Geometries: []Geometry{
						Point{
							Type:             feature1.Geometry().(*nlslayer.Point).PointType(),
							PointCoordinates: feature1.Geometry().(*nlslayer.Point).Coordinates(),
						},
						LineString{
							Type:                  feature2.Geometry().(*nlslayer.LineString).LineStringType(),
							LineStringCoordinates: feature2.Geometry().(*nlslayer.LineString).Coordinates(),
						},
						Polygon{
							Type:               feature3.Geometry().(*nlslayer.Polygon).PolygonType(),
							PolygonCoordinates: feature3.Geometry().(*nlslayer.Polygon).Coordinates(),
						},
						MultiPolygon{
							Type:                    feature4.Geometry().(*nlslayer.MultiPolygon).MultiPolygonType(),
							MultiPolygonCoordinates: feature4.Geometry().(*nlslayer.MultiPolygon).Coordinates(),
						},
					},
				},
				Properties: *feature5.Properties(),
			},
		},
	}

	tests := []struct {
		name string
		args *nlslayer.SketchInfo
		want *SketchInfo
	}{
		{
			name: "nil",
			args: nil,
			want: nil,
		},
		{
			name: "customPropertySchema and FeatureCollection are nil",
			args: nlslayer.NewSketchInfo(nil, nil),
			want: &SketchInfo{
				CustomPropertySchema: nil,
				FeatureCollection:    nil,
			},
		},
		{
			name: "FeatureCollection is nil",
			args: nlslayer.NewSketchInfo(
				&map[string]any{"key": "value"},
				nil,
			),
			want: &SketchInfo{
				CustomPropertySchema: map[string]any{"key": "value"},
				FeatureCollection:    nil,
			},
		},
		{
			name: "CustomPropertySchema is nil",
			args: nlslayer.NewSketchInfo(
				nil,
				featureCollection,
			),
			want: &SketchInfo{
				CustomPropertySchema: nil,
				FeatureCollection:    expectedFeatureCollection,
			},
		},
		{
			name: "not nil",
			args: nlslayer.NewSketchInfo(
				&map[string]any{"key": "value"},
				featureCollection,
			),
			want: &SketchInfo{
				CustomPropertySchema: map[string]any{"key": "value"},
				FeatureCollection:    expectedFeatureCollection,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToNLSLayerSketchInfo(tt.args))
		})
	}
}
