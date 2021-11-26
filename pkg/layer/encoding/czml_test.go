package encoding

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reearth/reearth-backend/pkg/czml"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Encoder = (*CZMLEncoder)(nil)

func TestCZMLEncoder_Encode(t *testing.T) {
	lid := id.NewLayerID()
	sid := id.NewSceneID()
	iid := id.NewPropertyItemID()

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
						PluginID:    &id.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("marker").Ref(),
					},
					Property: &property.Sealed{
						Original: id.NewPropertyID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    &iid,
								SchemaGroup: id.PropertySchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: id.PropertySchemaFieldID("location"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeLatLng,
											nil,
											property.ValueTypeLatLng.ValueFrom(property.LatLng{Lat: 4.4, Lng: 53.4}),
										),
									},
									{
										ID: id.PropertySchemaFieldID("height"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeNumber,
											nil,
											property.ValueTypeNumber.ValueFrom(34),
										),
									},
									{
										ID: id.PropertySchemaFieldID("pointColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#7fff00ff"),
										),
									},
									{
										ID: id.PropertySchemaFieldID("pointSize"),
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
						PluginID:    &id.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("polygon").Ref(),
					},
					Property: &property.Sealed{
						Original: id.NewPropertyID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    &iid,
								SchemaGroup: id.PropertySchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: id.PropertySchemaFieldID("polygon"),
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
										ID: id.PropertySchemaFieldID("fill"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeBool,
											nil,
											property.ValueTypeBool.ValueFrom(true),
										),
									},
									{
										ID: id.PropertySchemaFieldID("fillColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#ff000000"),
										),
									},
									{
										ID: id.PropertySchemaFieldID("stroke"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeBool,
											nil,
											property.ValueTypeBool.ValueFrom(true),
										),
									},
									{
										ID: id.PropertySchemaFieldID("strokeColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#ff554555"),
										),
									},
									{
										ID: id.PropertySchemaFieldID("strokeWidth"),
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
						PluginID:    &id.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("polyline").Ref(),
					},
					Property: &property.Sealed{
						Original: id.NewPropertyID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    &iid,
								SchemaGroup: id.PropertySchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: id.PropertySchemaFieldID("coordinates"),
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
										ID: id.PropertySchemaFieldID("strokeColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#ff224222"),
										),
									},
									{
										ID: id.PropertySchemaFieldID("strokeWidth"),
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
		t.Run(tt.name, func(t *testing.T) {
			expected, _ := json.Marshal(tt.want)
			writer := bytes.Buffer{}
			assert.NoError(t, NewCZMLEncoder(&writer).Encode(tt.target))
			assert.Equal(t, string(expected)+"\n", writer.String())
		})
	}
}
