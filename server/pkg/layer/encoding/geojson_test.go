package encoding

import (
	"bytes"
	"testing"

	"github.com/reearth/orb"
	"github.com/reearth/orb/geojson"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Encoder = (*GeoJSONEncoder)(nil)

func TestGeoJSONEncoder_Encode(t *testing.T) {
	tests := []struct {
		name   string
		target merging.SealedLayer
		want   func() *geojson.Feature
	}{
		{
			name: "point",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    layer.NewID(),
						Scene:       layer.NewSceneID(),
						Name:        "test",
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("marker").Ref(),
					},
					Property: &property.Sealed{
						Original: property.NewID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    property.NewItemID().Ref(),
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
										ID: property.FieldID("pointColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#7fff00ff"),
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
								},
							},
						},
					},
				},
			},
			want: func() *geojson.Feature {
				// f := geojson.NewFeature(geojson.NewPointGeometry([]float64{53.4, 4.4, 34}))
				f := geojson.NewFeature(orb.Point{53.4, 4.4, 34})
				f.Properties["marker-color"] = "#7fff00ff"
				f.Properties["name"] = "test"
				return f
			},
		},
		{
			name: "polygon",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    layer.NewID(),
						Scene:       layer.NewSceneID(),
						Name:        "test",
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("polygon").Ref(),
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
									{
										ID: property.FieldID("fillColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#7c3b3b"),
										),
									},
									{
										ID: property.FieldID("strokeColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#ff3343"),
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
			want: func() *geojson.Feature {
				expected := geojson.NewFeature(orb.Polygon{{{5.34, 3.4, 100}, {2.34, 45.4, 100}, {654.34, 34.66, 100}}})
				expected.Properties["name"] = "test"
				expected.Properties["fill"] = "#7c3b3b"
				expected.Properties["stroke"] = "#ff3343"
				expected.Properties["stroke-width"] = 3
				return expected
			},
		},
		{
			name: "polyline",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    layer.NewID(),
						Scene:       layer.NewSceneID(),
						Name:        "test",
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("polyline").Ref(),
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
									{
										ID: property.FieldID("strokeColor"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeString,
											nil,
											property.ValueTypeString.ValueFrom("#ff3343"),
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
			want: func() *geojson.Feature {
				expected := geojson.NewFeature(orb.LineString{{5.34, 3.4, 100}, {2.34, 45.4, 100}, {654.34, 34.66, 100}})
				expected.Properties["name"] = "test"
				expected.Properties["stroke"] = "#ff3343"
				expected.Properties["stroke-width"] = 3
				return expected
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			expected, _ := tt.want().MarshalJSON()
			writer := bytes.Buffer{}
			assert.NoError(t, NewGeoJSONEncoder(&writer).Encode(tt.target))
			assert.Equal(t, string(expected), writer.String())
		})
	}
}
