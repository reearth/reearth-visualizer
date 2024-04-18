package mongodoc

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestToModelNLSLayerSketchInfo(t *testing.T) {
	fid := nlslayer.NewFeatureID()
	property := map[string]any{"key1": "value1"}
	f, err := nlslayer.NewFeature(
		fid,
		"Feature",
		nlslayer.NewPoint("Point", []float64{1.0, 2.0}),
	)
	if err != nil {
		t.Fatal(err)
	}
	f.UpdateProperties(&property)
	fc := nlslayer.NewFeatureCollection("FeatureCollection", []nlslayer.Feature{*f})

	schema := map[string]any{"key1": "value1"}
	si := nlslayer.NewSketchInfo(
		&schema,
		fc,
	)

	tests := []struct {
		name    string
		args    *NLSLayerSketchInfoDocument
		want    *nlslayer.SketchInfo
		wantErr bool
	}{
		{
			name: "New point",
			args: &NLSLayerSketchInfoDocument{
				CustomPropertySchema: &map[string]any{"key1": "value1"},
				FeatureCollection: &NLSLayerFeatureCollectionDocument{
					Type: "FeatureCollection",
					Features: []NLSLayerFeatureDocument{
						{
							ID:   fid.String(),
							Type: "Feature",
							Geometry: map[string]any{
								"type":        "Point",
								"coordinates": primitive.A{1.0, 2.0},
							},
							Properties: map[string]any{"key1": "value1"},
						},
					},
				},
			},
			want:    si,
			wantErr: false,
		},
		{
			name:    "args is nil",
			args:    nil,
			want:    nil,
			wantErr: false,
		},
		{
			name: "FeatureCollection is nil",
			args: &NLSLayerSketchInfoDocument{
				CustomPropertySchema: &map[string]any{"key1": "value1"},
				FeatureCollection:    nil,
			},
			want:    nlslayer.NewSketchInfo(&schema, nil),
			wantErr: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := ToModelNLSLayerSketchInfo(tt.args)
			if (err != nil) != tt.wantErr {
				t.Errorf("actualValue() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestToModelNLSLayerGeometry(t *testing.T) {
	tests := []struct {
		name    string
		args    map[string]any
		want    nlslayer.Geometry
		wantErr bool
	}{
		{
			name: "New point",
			args: map[string]any{
				"type":        "Point",
				"coordinates": primitive.A{1.0, 2.0},
			},
			want:    nlslayer.NewPoint("Point", []float64{1.0, 2.0}),
			wantErr: false,
		},
		{
			name: "New line string",
			args: map[string]any{
				"type": "LineString",
				"coordinates": primitive.A{
					primitive.A{1.0, 2.0},
					primitive.A{3.0, 4.0},
				},
			},
			want:    nlslayer.NewLineString("LineString", [][]float64{{1.0, 2.0}, {3.0, 4.0}}),
			wantErr: false,
		},
		{
			name: "New polygon",
			args: map[string]any{
				"type": "Polygon",
				"coordinates": primitive.A{
					primitive.A{
						primitive.A{1.0, 2.0},
						primitive.A{3.0, 4.0},
						primitive.A{5.0, 6.0},
						primitive.A{1.0, 2.0},
					},
				},
			},
			want:    nlslayer.NewPolygon("Polygon", [][][]float64{{{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}, {1.0, 2.0}}}),
			wantErr: false,
		},
		{
			name: "New multi polygon",
			args: map[string]any{
				"type": "MultiPolygon",
				"coordinates": primitive.A{
					primitive.A{
						primitive.A{
							primitive.A{1.0, 2.0},
							primitive.A{3.0, 4.0},
							primitive.A{5.0, 6.0},
							primitive.A{1.0, 2.0},
						},
					},
				},
			},
			want:    nlslayer.NewMultiPolygon("MultiPolygon", [][][][]float64{{{{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}, {1.0, 2.0}}}}),
			wantErr: false,
		},
		{
			name: "New geometry collection",
			args: map[string]any{
				"type": "GeometryCollection",
				"geometries": primitive.A{
					map[string]interface{}{
						"type":        "Point",
						"coordinates": primitive.A{1.0, 2.0},
					},
					map[string]interface{}{
						"type": "LineString",
						"coordinates": primitive.A{
							primitive.A{1.0, 2.0},
							primitive.A{3.0, 4.0},
						},
					},
					map[string]interface{}{
						"type": "Polygon",
						"coordinates": primitive.A{
							primitive.A{
								primitive.A{1.0, 2.0},
								primitive.A{3.0, 4.0},
								primitive.A{5.0, 6.0},
								primitive.A{1.0, 2.0},
							},
						},
					},
					map[string]interface{}{
						"type": "MultiPolygon",
						"coordinates": primitive.A{
							primitive.A{
								primitive.A{
									primitive.A{1.0, 2.0},
									primitive.A{3.0, 4.0},
									primitive.A{5.0, 6.0},
									primitive.A{1.0, 2.0},
								},
							},
						},
					},
				},
			},
			want: nlslayer.NewGeometryCollection(
				"GeometryCollection",
				[]nlslayer.Geometry{
					nlslayer.NewPoint("Point", []float64{1.0, 2.0}),
					nlslayer.NewLineString("LineString", [][]float64{{1.0, 2.0}, {3.0, 4.0}}),
					nlslayer.NewPolygon("Polygon", [][][]float64{{{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}, {1.0, 2.0}}}),
					nlslayer.NewMultiPolygon("MultiPolygon", [][][][]float64{{{{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}, {1.0, 2.0}}}}),
				},
			),
			wantErr: false,
		},
		{
			name: "New invalid type",
			args: map[string]any{
				"type": "Invalid",
			},
			want:    nil,
			wantErr: true,
		},
		{
			name:    "args is nil",
			args:    nil,
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := ToModelNLSLayerGeometry(tt.args)
			if (err != nil) != tt.wantErr {
				t.Errorf("actualValue() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewNLSLayerSketchInfo(t *testing.T) {
	fid := nlslayer.NewFeatureID()
	property := map[string]any{"key1": "value1"}
	f, err := nlslayer.NewFeature(
		fid,
		"Feature",
		nlslayer.NewPoint("Point", []float64{1.0, 2.0}),
	)
	if err != nil {
		t.Fatal(err)
	}
	f.UpdateProperties(&property)
	fc := nlslayer.NewFeatureCollection("FeatureCollection", []nlslayer.Feature{*f})
	schema := map[string]any{"key1": "value1"}
	si := nlslayer.NewSketchInfo(
		&schema,
		fc,
	)

	expected := &NLSLayerSketchInfoDocument{
		CustomPropertySchema: &schema,
		FeatureCollection: &NLSLayerFeatureCollectionDocument{
			Type: "FeatureCollection",
			Features: []NLSLayerFeatureDocument{
				{
					ID:   fid.String(),
					Type: "Feature",
					Geometry: map[string]any{
						"type":        "Point",
						"coordinates": []float64{1, 2},
					},
					Properties: *f.Properties(),
				},
			},
		},
	}

	assert.Equal(t, expected, NewNLSLayerSketchInfo(si))
}

func TestNewNLSLayerFeatureCollection(t *testing.T) {
	fid := nlslayer.NewFeatureID()
	property := map[string]any{"key1": "value1"}
	f, err := nlslayer.NewFeature(
		fid,
		"Feature",
		nlslayer.NewPoint("Point", []float64{1.0, 2.0}),
	)
	if err != nil {
		t.Fatal(err)
	}
	f.UpdateProperties(&property)
	fc := nlslayer.NewFeatureCollection("FeatureCollection", []nlslayer.Feature{*f})

	expected := &NLSLayerFeatureCollectionDocument{
		Type: "FeatureCollection",
		Features: []NLSLayerFeatureDocument{
			{
				ID:   fid.String(),
				Type: "Feature",
				Geometry: map[string]any{
					"type":        "Point",
					"coordinates": []float64{1, 2},
				},
				Properties: *f.Properties(),
			},
		},
	}

	assert.Equal(t, expected, NewNLSLayerFeatureCollection(fc))
}

func TestNewNLSLayerFeature(t *testing.T) {
	fid := nlslayer.NewFeatureID()
	property := map[string]any{"key1": "value1"}
	f, err := nlslayer.NewFeature(
		fid,
		"Feature",
		nlslayer.NewPoint("Point", []float64{1.0, 2.0}),
	)
	if err != nil {
		t.Fatal(err)
	}
	f.UpdateProperties(&property)

	expected := NLSLayerFeatureDocument{
		ID:   fid.String(),
		Type: "Feature",
		Geometry: map[string]any{
			"type":        "Point",
			"coordinates": []float64{1, 2},
		},
		Properties: *f.Properties(),
	}

	assert.Equal(t, expected, NewNLSLayerFeature(*f))
}

func TestNewNLSLayerGeometry(t *testing.T) {
	tests := []struct {
		name string
		args nlslayer.Geometry
		want map[string]any
	}{
		{
			name: "New point",
			args: nlslayer.NewPoint("Point", []float64{1, 2}),
			want: map[string]any{
				"type":        "Point",
				"coordinates": []float64{1, 2},
			},
		},
		{
			name: "New line string",
			args: nlslayer.NewLineString("LineString", [][]float64{{1, 2}, {3, 4}}),
			want: map[string]any{
				"type":        "LineString",
				"coordinates": [][]float64{{1, 2}, {3, 4}},
			},
		},
		{
			name: "New polygon",
			args: nlslayer.NewPolygon("Polygon", [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}),
			want: map[string]any{
				"type":        "Polygon",
				"coordinates": [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}},
			},
		},
		{
			name: "New multi polygon",
			args: nlslayer.NewMultiPolygon("MultiPolygon", [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}}),
			want: map[string]any{
				"type":        "MultiPolygon",
				"coordinates": [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}},
			},
		},
		{
			name: "New geometry collection",
			args: nlslayer.NewGeometryCollection(
				"GeometryCollection",
				[]nlslayer.Geometry{
					nlslayer.NewPoint("Point", []float64{1, 2}),
					nlslayer.NewLineString("LineString", [][]float64{{1, 2}, {3, 4}}),
					nlslayer.NewPolygon("Polygon", [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}),
					nlslayer.NewMultiPolygon("MultiPolygon", [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}}),
				},
			),
			want: map[string]any{
				"type": "GeometryCollection",
				"geometries": []map[string]any{
					{
						"type":        "Point",
						"coordinates": []float64{1, 2},
					},
					{
						"type":        "LineString",
						"coordinates": [][]float64{{1, 2}, {3, 4}},
					},
					{
						"type":        "Polygon",
						"coordinates": [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}},
					},
					{
						"type":        "MultiPolygon",
						"coordinates": [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}},
					},
				},
			},
		},
		{
			name: "New invalid geometry",
			args: nlslayer.Geometry(nil),
			want: map[string]any{},
		},
		{
			name: "New point from redis map",
			args: map[string]any{
				"PointTypeField":   "Point",
				"CoordinatesField": []any{1, 2},
			},
			want: map[string]any{
				"type":        "Point",
				"coordinates": []any{1, 2},
			},
		},
		{
			name: "New line string from redis map",
			args: map[string]any{
				"LineStringTypeField": "LineString",
				"CoordinatesField":    [][]any{{1, 2}, {3, 4}},
			},
			want: map[string]any{
				"type":        "LineString",
				"coordinates": [][]any{{1, 2}, {3, 4}},
			},
		},
		{
			name: "New polygon from redis map",
			args: map[string]any{
				"PolygonTypeField": "Polygon",
				"CoordinatesField": [][][]any{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}},
			},
			want: map[string]any{
				"type":        "Polygon",
				"coordinates": [][][]any{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}},
			},
		},
		{
			name: "New multi polygon from redis map",
			args: map[string]any{
				"MultiPolygonTypeField": "MultiPolygon",
				"CoordinatesField":      [][][][]any{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}},
			},
			want: map[string]any{
				"type":        "MultiPolygon",
				"coordinates": [][][][]any{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}},
			},
		},
		{
			name: "New geometry collection from redis map",
			args: map[string]any{
				"GeometryCollectionTypeField": "GeometryCollection",
				"GeometriesField": []any{
					map[string]any{
						"PointTypeField":   "Point",
						"CoordinatesField": []any{1, 2},
					},
					map[string]any{
						"LineStringTypeField": "LineString",
						"CoordinatesField":    [][]any{{1, 2}, {3, 4}},
					},
					map[string]any{
						"PolygonTypeField": "Polygon",
						"CoordinatesField": [][][]any{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}},
					},
					map[string]any{
						"MultiPolygonTypeField": "MultiPolygon",
						"CoordinatesField":      [][][][]any{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}},
					},
				},
			},
			want: map[string]any{
				"type": "GeometryCollection",
				"geometries": []map[string]any{
					{
						"type":        "Point",
						"coordinates": []any{1, 2},
					},
					{
						"type":        "LineString",
						"coordinates": [][]any{{1, 2}, {3, 4}},
					},
					{
						"type":        "Polygon",
						"coordinates": [][][]any{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}},
					},
					{
						"type":        "MultiPolygon",
						"coordinates": [][][][]any{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}},
					},
				},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewNLSLayerGeometry(tt.args))
		})
	}
}
