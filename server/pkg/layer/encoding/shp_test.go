package encoding

import (
	"os"
	"testing"

	"github.com/jonas-p/go-shp"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Encoder = (*SHPEncoder)(nil)

func TestEncodeSHP(t *testing.T) {
	tests := []struct {
		name  string
		layer *merging.SealedLayerItem
		want  shp.Shape
	}{
		{
			name: "polygon",
			layer: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    layer.NewID(),
						Parent:      nil,
						Scene:       layer.NewSceneID(),
						Property:    nil,
						Infobox:     nil,
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: layer.PluginExtensionID("polygon").Ref(),
					},
					Property: &property.Sealed{
						Original: property.NewID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    property.NewItemID().Ref(),
								SchemaGroup: property.SchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: property.FieldID("polygon"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypePolygon,
											nil,
											property.ValueTypePolygon.ValueFrom(property.Polygon{property.Coordinates{
												{Lat: 3.4, Lng: 5.34, Height: 100},
												{Lat: 45.4, Lng: 2.34, Height: 100},
												{Lat: 34.66, Lng: 654.34, Height: 100},
											}}),
										),
									},
								},
							},
						},
					},
				},
			},
			want: &shp.Polygon{
				Box: shp.Box{
					MinX: 2.34,
					MaxX: 654.34,
					MinY: 3.4,
					MaxY: 45.4,
				},
				NumParts:  1,
				NumPoints: 3,
				Parts:     []int32{0},
				Points: []shp.Point{
					{X: 5.34, Y: 3.4},
					{X: 2.34, Y: 45.4},
					{X: 654.34, Y: 34.66},
				},
			},
		},
		{
			name: "polyline",
			layer: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    layer.NewID(),
						Parent:      nil,
						Name:        "test",
						Scene:       layer.NewSceneID(),
						Property:    nil,
						Infobox:     nil,
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: layer.PluginExtensionID("polyline").Ref(),
					},
					Property: &property.Sealed{
						Original: property.NewID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    property.NewItemID().Ref(),
								SchemaGroup: property.SchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: property.FieldID("coordinates"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeCoordinates,
											nil,
											property.ValueTypeCoordinates.ValueFrom(property.Coordinates{
												{Lat: 3.4, Lng: 5.34, Height: 100},
												{Lat: 45.4, Lng: 2.34, Height: 100},
												{Lat: 34.66, Lng: 654.34, Height: 100},
											}),
										),
									},
								},
							},
						},
					},
				},
			},
			want: &shp.PolyLine{
				Box: shp.Box{
					MinX: 2.34,
					MaxX: 654.34,
					MinY: 3.4,
					MaxY: 45.4,
				},
				NumParts:  1,
				NumPoints: 3,
				Parts:     []int32{0},
				Points: []shp.Point{
					{X: 5.34, Y: 3.4},
					{X: 2.34, Y: 45.4},
					{X: 654.34, Y: 34.66},
				},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// sequential test

			tmpFile, err := os.CreateTemp(os.TempDir(), "*.shp")
			assert.NoError(t, err)
			en := NewSHPEncoder(tmpFile)
			assert.NoError(t, en.Encode(tt.layer))
			assert.NoError(t, tmpFile.Close())

			shape, err := shp.Open(tmpFile.Name())
			assert.NoError(t, err)
			assert.True(t, shape.Next())

			assert.NoError(t, shape.Close())
			assert.NoError(t, os.Remove(tmpFile.Name()))

			_, p := shape.Shape()
			assert.Equal(t, tt.want, p)
		})
	}
}
