package decoding

import (
	"strings"
	"testing"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Decoder = &GeoJSONDecoder{}

const geojsonmock = `{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "EPSG:3857"
    }
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          102.0,
          0.5
        ]
      },
      "properties": {
        "marker-color": "red"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            102.0,
            0.0
          ],
          [
            103.0,
            1.0
          ],
          [
            104.0,
            0.0
          ]
        ]
      },
      "properties": {
        "stroke": "#b55e5e",
        "stroke-width": 1.6,
        "prop0": "value0",
        "prop1": 0.0
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              100.0,
              0.0
            ],
            [
              101.0,
              0.0
            ],
            [
              101.0,
              1.0
            ],
            [
              100.0,
              1.0
            ],
            [
              100.0,
              0.0
            ]
          ]
        ]
      },
      "properties": {
        "stroke": "#ffffff",
        "stroke-width": 2,
        "stroke-opacity": 1,
        "fill": "#7c3b3b",
        "fill-opacity": 0.5,
        "prop0": "value0",
        "prop1": {
          "this": "that"
        }
      }
    },
{
            "type": "Feature",
            "geometry": null,
            "properties": {
                "N03_001": "愛知県",
                "N03_002": null,
                "N03_003": null,
                "N03_004": "豊橋市",
                "N03_007": "23201"
            }
        },
    {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                100.0,
                0.0
              ],
              [
                101.0,
                0.0
              ],
              [
                101.0,
                1.0
              ],
              [
                100.0,
                1.0
              ],
              [
                100.0,
                0.0
              ]
            ]
          ]
        ]
      },
      "properties": {
        "stroke": "#ffffff",
        "stroke-width": 2,
        "stroke-opacity": 1,
        "fill": "#7c3b3b",
        "fill-opacity": 0.5,
        "prop0": "value0",
        "prop1": {
          "this": "that"
        }
      }
    }
  ]
}`

func TestGeoJSONDecoder_Decode(t *testing.T) {
	r := strings.NewReader(geojsonmock)
	s := layer.NewSceneID()
	p := NewGeoJSONDecoder(r, s)
	result, err := p.Decode()
	assert.NoError(t, err)
	assert.Equal(t, 5, len(result.Layers))
	assert.Equal(t, 4, len(result.Properties))

	// Root layer
	rootLayer := result.RootLayers().ToLayerGroupList()[0]
	assert.NotNil(t, rootLayer)
	assert.Equal(t, 4, rootLayer.Layers().LayerCount())

	// marker
	prop := result.Properties[*result.Layers.Layer(rootLayer.Layers().LayerAt(0)).Property()]
	items := prop.Items()
	assert.NotEqual(t, 0, len(items))
	item := propertyItems
	field := propertyFields["Point"]
	f, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, field))
	fColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "pointColor"))
	assert.Equal(t, "red", fColor.Value().Value())
	assert.Equal(t, f.Value().Value(), property.LatLng{Lng: 102.0, Lat: 0.5})

	// Polyline
	prop = result.Properties[*result.Layers.Layer(rootLayer.Layers().LayerAt(1)).Property()]
	items2 := prop.Items()
	assert.NotEqual(t, 0, len(items2))
	field2 := propertyFields["Polyline"]
	f2, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, field2))
	plist := property.Coordinates{{Lng: 102.0, Lat: 0.0, Height: 0}, {Lng: 103.0, Lat: 1.0, Height: 0}, {Lng: 104.0, Lat: 0.0, Height: 0}}
	assert.Equal(t, f2.Value().Value(), plist)
	strokeColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "strokeColor"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, "#b55e5e", strokeColor.Value().Value())
	strokeWidth, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "strokeWidth"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, 1.6, strokeWidth.Value().Value())

	// Polygon
	prop = result.Properties[*result.Layers.Layer(rootLayer.Layers().LayerAt(2)).Property()]
	items3 := prop.Items()
	assert.NotEqual(t, 0, len(items3))
	field3 := propertyFields["Polygon"]
	f3, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, field3))
	plist2 := property.Polygon{property.Coordinates{property.LatLngHeight{Lng: 100, Lat: 0, Height: 0}, property.LatLngHeight{Lng: 101, Lat: 0, Height: 0}, property.LatLngHeight{Lng: 101, Lat: 1, Height: 0}, property.LatLngHeight{Lng: 100, Lat: 1, Height: 0}, property.LatLngHeight{Lng: 100, Lat: 0, Height: 0}}}
	assert.Equal(t, f3.Value().Value(), plist2)
	fillColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "fillColor"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, "#7c3b3b", fillColor.Value().Value())
	strokeColor2, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "strokeColor"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, "#ffffff", strokeColor2.Value().Value())
	strokeWidth2, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "strokeWidth"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, 2.0, strokeWidth2.Value().Value())

	// MultiPolygon
	prop = result.Properties[*result.Layers.Layer(rootLayer.Layers().LayerAt(2)).Property()]
	items4 := prop.Items()
	assert.NotEqual(t, 0, len(items4))
	field4 := propertyFields["Polygon"]
	f4, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, field4))
	plist3 := property.Polygon{property.Coordinates{property.LatLngHeight{Lng: 100, Lat: 0, Height: 0}, property.LatLngHeight{Lng: 101, Lat: 0, Height: 0}, property.LatLngHeight{Lng: 101, Lat: 1, Height: 0}, property.LatLngHeight{Lng: 100, Lat: 1, Height: 0}, property.LatLngHeight{Lng: 100, Lat: 0, Height: 0}}}
	assert.Equal(t, f4.Value().Value(), plist3)
	fillColor2, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "fillColor"))
	assert.Equal(t, plist3, f3.Value().Value())
	assert.Equal(t, "#7c3b3b", fillColor2.Value().Value())
	strokeColor3, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "strokeColor"))
	assert.Equal(t, plist3, f3.Value().Value())
	assert.Equal(t, "#ffffff", strokeColor3.Value().Value())
	strokeWidth3, _, _ := prop.Field(property.PointFieldBySchemaGroup(item, "strokeWidth"))
	assert.Equal(t, plist3, f3.Value().Value())
	assert.Equal(t, 2.0, strokeWidth3.Value().Value())
}
