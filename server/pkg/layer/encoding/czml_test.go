package encoding

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reearth/reearth/server/pkg/czml"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Encoder = (*CZMLEncoder)(nil)

func TestCZMLEncoder_Encode(t *testing.T) {
	lid := layer.NewID()
	sid := layer.NewSceneID()
	iid := property.NewItemID()

	tests := []struct {
		name   string
		target merging.SealedLayer
		want   []*czml.Feature
	}{
		{
			name: "marker",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    lid,
						Name:        "test",
						Scene:       sid,
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: layer.PluginExtensionID("marker").Ref(),
					},
					Property: &property.Sealed{
						Original: property.NewID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    &iid,
								SchemaGroup: property.SchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: property.FieldID("location"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeLatLng,
											nil,
											property.ValueTypeLatLng.ValueFrom(property.LatLng{Lat: 4.4, Lng: 53.4}),
										),
									},
									{
										ID: property.FieldID("height"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeNumber,
											nil,
											property.ValueTypeNumber.ValueFrom(34),
										),
									},
									{
										ID: property.FieldID("pointColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#7fff00ff"),
										),
									},
									{
										ID: property.FieldID("pointSize"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeNumber,
											nil,
											property.ValueTypeNumber.ValueFrom(2.4),
										),
									},
								},
							},
						},
					},
				},
			},
			want: []*czml.Feature{
				{
					Id:       lid.String(),
					Name:     "test",
					Position: &czml.Position{CartographicDegrees: []float64{53.4, 4.4, 34}},
					Point: &czml.Point{
						Color:     "#7fff00ff",
						PixelSize: float64(2.4),
					},
				},
			},
		},
		{
			name: "polygon",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    lid,
						Name:        "test",
						Scene:       sid,
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: layer.PluginExtensionID("polygon").Ref(),
					},
					Property: &property.Sealed{
						Original: property.NewID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    &iid,
								SchemaGroup: property.SchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: property.FieldID("polygon"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypePolygon,
											nil,
											property.ValueTypePolygon.ValueFrom(
												property.Polygon{property.Coordinates{
													{Lat: 3.4, Lng: 5.34, Height: 100},
													{Lat: 45.4, Lng: 2.34, Height: 100},
													{Lat: 34.66, Lng: 654.34, Height: 100},
												}},
											),
										),
									},
									{
										ID: property.FieldID("fill"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeBool,
											nil,
											property.ValueTypeBool.ValueFrom(true),
										),
									},
									{
										ID: property.FieldID("fillColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#ff000000"),
										),
									},
									{
										ID: property.FieldID("stroke"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeBool,
											nil,
											property.ValueTypeBool.ValueFrom(true),
										),
									},
									{
										ID: property.FieldID("strokeColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#ff554555"),
										),
									},
									{
										ID: property.FieldID("strokeWidth"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeNumber,
											nil,
											property.ValueTypeNumber.ValueFrom(3),
										),
									},
								},
							},
						},
					},
				},
			},
			want: []*czml.Feature{
				{
					Id:   lid.String(),
					Name: "test",
					Polygon: &czml.Polygon{
						Positions: czml.Position{CartographicDegrees: []float64{5.34, 3.4, 100, 2.34, 45.4, 100, 654.34, 34.66, 100}},
						Fill:      true,
						Material: &czml.Material{
							SolidColor: &czml.SolidColor{Color: &czml.Color{RGBA: []int64{255, 0, 0, 0}}},
						},
						Stroke:      true,
						StrokeColor: &czml.Color{RGBA: []int64{255, 85, 69, 85}},
						StrokeWidth: 3,
					},
				},
			},
		},
		{
			name: "polyline",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    lid,
						Name:        "test",
						Scene:       sid,
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: layer.PluginExtensionID("polyline").Ref(),
					},
					Property: &property.Sealed{
						Original: property.NewID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    &iid,
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
									{
										ID: property.FieldID("strokeColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#ff224222"),
										),
									},
									{
										ID: property.FieldID("strokeWidth"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeNumber,
											nil,
											property.ValueTypeNumber.ValueFrom(3),
										),
									},
								},
							},
						},
					},
				},
			},
			want: []*czml.Feature{
				{
					Id:   lid.String(),
					Name: "test",
					Polyline: &czml.Polyline{
						Positions: czml.Position{CartographicDegrees: []float64{5.34, 3.4, 100, 2.34, 45.4, 100, 654.34, 34.66, 100}},
						Material: &czml.Material{PolylineOutline: &czml.PolylineOutline{
							Color: &czml.Color{RGBA: []int64{255, 34, 66, 34}},
						}},
						Width: 3,
					},
				},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			expected, _ := json.Marshal(tt.want)
			writer := bytes.Buffer{}
			assert.NoError(t, NewCZMLEncoder(&writer).Encode(tt.target))
			assert.Equal(t, string(expected)+"\n", writer.String())
		})
	}
}
