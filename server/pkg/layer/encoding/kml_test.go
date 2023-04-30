package encoding

import (
	"bytes"
	"testing"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
	"github.com/twpayne/go-kml/v3"
)

var _ Encoder = (*KMLEncoder)(nil)

func TestKMLEncoder_Encode(t *testing.T) {
	lid := layer.MustID("01fmph48ykj1nd82r8e4znh6a6")

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
						Scene:       layer.NewSceneID(),
						Name:        "test",
						PluginID:    &layer.OfficialPluginID,
						ExtensionID: layer.PluginExtensionID("marker").Ref(),
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
										ID: property.FieldID("height"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeNumber,
											nil,
											property.ValueTypeNumber.ValueFrom(100),
										),
									},
									{
										ID: property.FieldID("imageSize"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeNumber,
											nil,
											property.ValueTypeNumber.ValueFrom(4),
										),
									},
									{
										ID: property.FieldID("image"),
										Val: property.NewValueAndDatasetValue(
											property.ValueTypeURL,
											nil,
											property.ValueTypeURL.ValueFrom("http://maps.google.com/mapfiles/kml/pal4/icon28.png"),
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
						Scene:       layer.NewSceneID(),
						Name:        "test",
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
												property.LatLngHeight{Lat: 3.4, Lng: 5.34, Height: 100},
												property.LatLngHeight{Lat: 45.4, Lng: 2.34, Height: 100},
												property.LatLngHeight{Lat: 34.66, Lng: 654.34, Height: 100},
											}}),
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
											property.ValueTypeString.ValueFrom("#ff334353"),
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
						Scene:       layer.NewSceneID(),
						Name:        "test",
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
												property.LatLngHeight{Lat: 3.4, Lng: 5.34, Height: 100},
												property.LatLngHeight{Lat: 45.4, Lng: 2.34, Height: 100},
												property.LatLngHeight{Lat: 34.66, Lng: 654.34, Height: 100},
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
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			we := bytes.Buffer{}
			_ = tt.want().WriteIndent(&we, "", "  ")
			wa := bytes.Buffer{}
			assert.NoError(t, NewKMLEncoder(&wa).Encode(tt.target))
			assert.Equal(t, we.String(), wa.String())
		})
	}
}
