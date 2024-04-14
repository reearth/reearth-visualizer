package nlslayer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPoint(t *testing.T) {
	p := NewPoint("Point", []float64{1, 2})

	assert.Equal(t, "Point", p.PointType())
	assert.Equal(t, []float64{1, 2}, p.Coordinates())
}

func TestNewLineString(t *testing.T) {
	l := NewLineString("LineString", [][]float64{{1, 2}, {3, 4}})

	assert.Equal(t, "LineString", l.LineStringType())
	assert.Equal(t, [][]float64{{1, 2}, {3, 4}}, l.Coordinates())
}

func TestNewPolygon(t *testing.T) {
	p := NewPolygon("Polygon", [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}})

	assert.Equal(t, "Polygon", p.PolygonType())
	assert.Equal(t, [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}, p.Coordinates())
}

func TestNewMultiPolygon(t *testing.T) {
	m := NewMultiPolygon("MultiPolygon", [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}})

	assert.Equal(t, "MultiPolygon", m.MultiPolygonType())
	assert.Equal(t, [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}}, m.Coordinates())
}

func TestNewGeometryCollection(t *testing.T) {
	p := NewPoint("Point", []float64{1, 2})
	l := NewLineString("LineString", [][]float64{{1, 2}, {3, 4}})
	po := NewPolygon("Polygon", [][][]float64{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}})
	m := NewMultiPolygon("MultiPolygon", [][][][]float64{{{{1, 2}, {3, 4}, {5, 6}, {1, 2}}}})
	gc := NewGeometryCollection("GeometryCollection", []Geometry{p, l, po, m})

	assert.Equal(t, "GeometryCollection", gc.GeometryCollectionType())
	assert.Equal(t, []Geometry{p, l, po, m}, gc.Geometries())
}

func TestNewGeometryFromMap(t *testing.T) {
	tests := []struct {
		name    string
		input   map[string]any
		want    Geometry
		wantErr bool
	}{
		{
			name: "Point",
			input: map[string]any{
				"type":        "Point",
				"coordinates": []interface{}{1.0, 2.0},
			},
			want: &Point{
				PointTypeField:   "Point",
				CoordinatesField: []float64{1.0, 2.0},
			},
			wantErr: false,
		},
		{
			name: "LineString",
			input: map[string]any{
				"type": "LineString",
				"coordinates": []interface{}{
					[]interface{}{1.0, 2.0},
					[]interface{}{3.0, 4.0},
				},
			},
			want: &LineString{
				LineStringTypeField: "LineString",
				CoordinatesField: [][]float64{
					{1.0, 2.0},
					{3.0, 4.0},
				},
			},
			wantErr: false,
		},
		{
			name: "Polygon",
			input: map[string]any{
				"type": "Polygon",
				"coordinates": []interface{}{
					[]interface{}{
						[]interface{}{1.0, 2.0},
						[]interface{}{3.0, 4.0},
						[]interface{}{5.0, 6.0},
						[]interface{}{1.0, 2.0},
					},
				},
			},
			want: &Polygon{
				PolygonTypeField: "Polygon",
				CoordinatesField: [][][]float64{{
					{1.0, 2.0},
					{3.0, 4.0},
					{5.0, 6.0},
					{1.0, 2.0},
				}},
			},
			wantErr: false,
		},
		{
			name: "MultiPolygon",
			input: map[string]any{
				"type": "MultiPolygon",
				"coordinates": []interface{}{
					[]interface{}{
						[]interface{}{
							[]interface{}{1.0, 2.0},
							[]interface{}{3.0, 4.0},
							[]interface{}{5.0, 6.0},
							[]interface{}{1.0, 2.0},
						},
					},
				},
			},
			want: &MultiPolygon{
				MultiPolygonTypeField: "MultiPolygon",
				CoordinatesField: [][][][]float64{{{
					{1.0, 2.0},
					{3.0, 4.0},
					{5.0, 6.0},
					{1.0, 2.0},
				}}},
			},
			wantErr: false,
		},
		{
			name: "GeometryCollection",
			input: map[string]any{
				"type": "GeometryCollection",
				"geometries": []interface{}{
					map[string]any{
						"type":        "Point",
						"coordinates": []interface{}{1.0, 2.0},
					},
					map[string]any{
						"type": "LineString",
						"coordinates": []interface{}{
							[]interface{}{1.0, 2.0},
							[]interface{}{3.0, 4.0},
						},
					},
					map[string]any{
						"type": "Polygon",
						"coordinates": []interface{}{
							[]interface{}{
								[]interface{}{1.0, 2.0},
								[]interface{}{3.0, 4.0},
								[]interface{}{5.0, 6.0},
								[]interface{}{1.0, 2.0},
							},
						},
					},
					map[string]any{
						"type": "MultiPolygon",
						"coordinates": []interface{}{
							[]interface{}{
								[]interface{}{
									[]interface{}{1.0, 2.0},
									[]interface{}{3.0, 4.0},
									[]interface{}{5.0, 6.0},
									[]interface{}{1.0, 2.0},
								},
							},
						},
					},
				},
			},
			want: &GeometryCollection{
				GeometryCollectionTypeField: "GeometryCollection",
				GeometriesField: []Geometry{
					&Point{
						PointTypeField:   "Point",
						CoordinatesField: []float64{1.0, 2.0},
					},
					&LineString{
						LineStringTypeField: "LineString",
						CoordinatesField: [][]float64{
							{1.0, 2.0},
							{3.0, 4.0},
						},
					},
					&Polygon{
						PolygonTypeField: "Polygon",
						CoordinatesField: [][][]float64{{
							{1.0, 2.0},
							{3.0, 4.0},
							{5.0, 6.0},
							{1.0, 2.0},
						}},
					},
					&MultiPolygon{
						MultiPolygonTypeField: "MultiPolygon",
						CoordinatesField: [][][][]float64{{{
							{1.0, 2.0},
							{3.0, 4.0},
							{5.0, 6.0},
							{1.0, 2.0},
						}}},
					},
				},
			},
			wantErr: false,
		},
		{
			name: "Invalid geometry type",
			input: map[string]any{
				"type": "Unknown",
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := NewGeometryFromMap(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("NewGeometryFromMap() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			assert.Equal(t, got, tt.want)
		})
	}
}
