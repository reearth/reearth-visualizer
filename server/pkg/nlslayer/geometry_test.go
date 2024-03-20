package nlslayer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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
				pointType:   "Point",
				coordinates: []float64{1.0, 2.0},
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
				lineStringType: "LineString",
				coordinates: [][]float64{
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
				polygonType: "Polygon",
				coordinates: [][][]float64{{
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
				multiPolygonType: "MultiPolygon",
				coordinates: [][][][]float64{{{
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
				geometryCollectionType: "GeometryCollection",
				geometries: []Geometry{
					&Point{
						pointType:   "Point",
						coordinates: []float64{1.0, 2.0},
					},
					&LineString{
						lineStringType: "LineString",
						coordinates: [][]float64{
							{1.0, 2.0},
							{3.0, 4.0},
						},
					},
					&Polygon{
						polygonType: "Polygon",
						coordinates: [][][]float64{{
							{1.0, 2.0},
							{3.0, 4.0},
							{5.0, 6.0},
							{1.0, 2.0},
						}},
					},
					&MultiPolygon{
						multiPolygonType: "MultiPolygon",
						coordinates: [][][][]float64{{{
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
