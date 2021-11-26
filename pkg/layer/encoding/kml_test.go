package encoding

import (
	"bytes"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
	"github.com/twpayne/go-kml"
)

var _ Encoder = (*KMLEncoder)(nil)

func TestKMLEncoder_Encode(t *testing.T) {
	lid := id.MustLayerID("01fmph48ykj1nd82r8e4znh6a6")

	tests := []struct {
		name   string
		target merging.SealedLayer
		want   func() *kml.CompoundElement
	}{
		{
			name: "marker",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    lid,
						Scene:       id.NewSceneID(),
						Name:        "test",
						PluginID:    &id.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("marker").Ref(),
					},
					Property: &property.Sealed{
						Original: id.NewPropertyID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    id.NewPropertyItemID().Ref(),
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
											property.ValueTypeNumber.ValueFrom(100),
										),
									},
									{
										ID: id.PropertySchemaFieldID("imageSize"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeNumber,
											nil,
											property.ValueTypeNumber.ValueFrom(4),
										),
									},
									{
										ID: id.PropertySchemaFieldID("image"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeURL,
											nil,
											property.ValueTypeURL.ValueFrom("http://maps.google.com/mapfiles/kml/pal4/icon28.png"),
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
								},
							},
						},
					},
				},
			},
			want: func() *kml.CompoundElement {
				k := kml.KML(
					kml.SharedStyle(
						"01fmph48ykj1nd82r8e4znh6a6_style",
						kml.IconStyle(
							kml.Icon(kml.Href("http://maps.google.com/mapfiles/kml/pal4/icon28.png")),
							kml.Scale(4),
							kml.Color(getColor("#7fff00ff")),
						),
					),
				)
				k = k.Add(
					kml.Placemark(
						kml.Name("test"),
						kml.Point(kml.Coordinates(kml.Coordinate{Lon: 53.4, Lat: 4.4, Alt: 100})),
						kml.StyleURL("#01fmph48ykj1nd82r8e4znh6a6_style"),
					),
				)
				return k
			},
		},
		{
			name: "polygon",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    lid,
						Scene:       id.NewSceneID(),
						Name:        "test",
						PluginID:    &id.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("polygon").Ref(),
					},
					Property: &property.Sealed{
						Original: id.NewPropertyID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    id.NewPropertyItemID().Ref(),
								SchemaGroup: id.PropertySchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: id.PropertySchemaFieldID("polygon"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypePolygon,
											nil,
											property.ValueTypePolygon.ValueFrom(property.Polygon{property.Coordinates{
												property.LatLngHeight{Lat: 3.4, Lng: 5.34, Height: 100},
												property.LatLngHeight{Lat: 45.4, Lng: 2.34, Height: 100},
												property.LatLngHeight{Lat: 34.66, Lng: 654.34, Height: 100},
											}}),
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
											property.ValueTypeString.ValueFrom("#ff334353"),
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
			want: func() *kml.CompoundElement {
				k := kml.KML(
					kml.SharedStyle(
						"01fmph48ykj1nd82r8e4znh6a6_style",
						kml.PolyStyle(
							kml.Fill(true),
							kml.Color(getColor("#ff334353")),
						),
						kml.LineStyle(
							kml.Outline(true),
							kml.Color(getColor("#ff554555")),
							kml.Width(3),
						),
					),
				)
				k = k.Add(
					kml.Placemark(kml.Name("test"),
						kml.Polygon(kml.OuterBoundaryIs(kml.LinearRing(kml.Coordinates(
							kml.Coordinate{Lon: 5.34, Lat: 3.4, Alt: 100},
							kml.Coordinate{Lon: 2.34, Lat: 45.4, Alt: 100},
							kml.Coordinate{Lon: 654.34, Lat: 34.66, Alt: 100},
						)))),
						kml.StyleURL("#01fmph48ykj1nd82r8e4znh6a6_style"),
					),
				)
				return k
			},
		},
		{
			name: "polyline",
			target: &merging.SealedLayerItem{
				SealedLayerCommon: merging.SealedLayerCommon{
					Merged: layer.Merged{
						Original:    lid,
						Scene:       id.NewSceneID(),
						Name:        "test",
						PluginID:    &id.OfficialPluginID,
						ExtensionID: id.PluginExtensionID("polyline").Ref(),
					},
					Property: &property.Sealed{
						Original: id.NewPropertyID().Ref(),
						Items: []*property.SealedItem{
							{
								Original:    id.NewPropertyItemID().Ref(),
								SchemaGroup: id.PropertySchemaGroupID("default"),
								Fields: []*property.SealedField{
									{
										ID: id.PropertySchemaFieldID("coordinates"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeCoordinates,
											nil,
											property.ValueTypeCoordinates.ValueFrom(property.Coordinates{
												property.LatLngHeight{Lat: 3.4, Lng: 5.34, Height: 100},
												property.LatLngHeight{Lat: 45.4, Lng: 2.34, Height: 100},
												property.LatLngHeight{Lat: 34.66, Lng: 654.34, Height: 100},
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
			want: func() *kml.CompoundElement {
				k := kml.KML(
					kml.SharedStyle(
						"01fmph48ykj1nd82r8e4znh6a6_style",
						kml.LineStyle(
							kml.Color(getColor("#ff224222")),
							kml.Width(3),
						),
					),
				)
				k = k.Add(
					kml.Placemark(
						kml.Name("test"),
						kml.LineString(kml.Coordinates(
							kml.Coordinate{Lon: 5.34, Lat: 3.4, Alt: 100},
							kml.Coordinate{Lon: 2.34, Lat: 45.4, Alt: 100},
							kml.Coordinate{Lon: 654.34, Lat: 34.66, Alt: 100},
						)),
						kml.StyleURL("#01fmph48ykj1nd82r8e4znh6a6_style"),
					),
				)
				return k
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			we := bytes.Buffer{}
			_ = tt.want().WriteIndent(&we, "", "  ")
			wa := bytes.Buffer{}
			assert.NoError(t, NewKMLEncoder(&wa).Encode(tt.target))
			assert.Equal(t, we.String(), wa.String())
		})
	}
}
