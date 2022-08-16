package decoding

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Decoder = &CZMLDecoder{}

const (
	czmlmock = `[{
    "id" : "document",
    "name" : "CZML Geometries",
    "version" : "1.0"
},
{
    "id" : "point 1",
    "name": "point",
    "position" : {
        "cartographicDegrees" : [-111.0, 40.0, 0]
    },
    "point": {
        "color": "red",
        "outlineColor": {
            "rgba": [255, 0, 0, 255]
        },
        "outlineWidth" : 4,
        "pixelSize": 20
    }
},
{
    "id" : "purpleLine",
    "name" : "Purple arrow at height",
    "polyline" : {
        "positions" : {
            "cartographicDegrees" : [
                -75, 43, 500000,
                -125, 43, 500000
            ]
        },
        "material" : {
            "polylineOutline" : {
                "color" : {
                    "rgba" : [148, 0, 211, 255]
                }
            }
        },
        "arcType" : "NONE",
        "width" : 10
    }
},{
    "id" : "testPoly",
    "name" : "Red polygon on surface",
    "polygon" : {
        "positions" : {
            "cartographicDegrees" : [
                -115.0, 37.0, 0,
                -115.0, 32.0, 0,
                -107.0, 33.0, 0,
                -102.0, 31.0, 0,
                -102.0, 35.0, 0
            ]
        },
        "fill":true,
        "outline":true,
        "outlineWidth":4,
        "material" : {
            "solidColor" : {
                "color" : {
                    "rgba" : [4, 190, 32, 144]
                }
            }
        },
		 "outlineColor":{
                    "rgbaf" : [0.434,0.6,0.8766,0]
        }
    }
}]`
)

func TestCZMLDecoder_Decode(t *testing.T) {
	r := strings.NewReader(czmlmock)
	d := json.NewDecoder(r)
	s := layer.NewSceneID()
	p := NewCZMLDecoder(d, s)
	result, err := p.Decode()
	assert.NoError(t, err)
	assert.Equal(t, 4, len(result.Layers))
	assert.Equal(t, 3, len(result.Properties))

	// Root layer
	rootLayer := result.RootLayers().ToLayerGroupList()[0]
	assert.NotNil(t, rootLayer)
	assert.Equal(t, 3, rootLayer.Layers().LayerCount())

	// marker
	prop := result.Properties[*result.Layers.Layer(rootLayer.Layers().LayerAt(0)).Property()]
	field := propertyFields["Point"]
	f, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, field))
	fColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "pointColor"))
	fSize, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "pointSize"))
	assert.Equal(t, "red", fColor.Value().Value())
	assert.Equal(t, 20.0, fSize.Value().Value())
	assert.Equal(t, f.Value().Value(), property.LatLng{Lng: -111.0, Lat: 40.0})

	// Polyline
	prop = result.Properties[*result.Layers.Layer(rootLayer.Layers().LayerAt(1)).Property()]
	field2 := propertyFields["Polyline"]
	f2, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, field2))
	plist := property.Coordinates{{Lng: -75, Lat: 43, Height: 500000}, {Lng: -125, Lat: 43, Height: 500000}}
	assert.Equal(t, f2.Value().Value(), plist)
	strokeColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "strokeColor"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, "9400d3ff", strokeColor.Value().Value())
	strokeWidth, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "strokeWidth"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, 10.0, strokeWidth.Value().Value())

	// Polygon
	prop = result.Properties[*result.Layers.Layer(rootLayer.Layers().LayerAt(2)).Property()]
	field3 := propertyFields["Polygon"]
	f3, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, field3))
	plist2 := property.Polygon{property.Coordinates{property.LatLngHeight{Lng: -115, Lat: 37, Height: 0}}, property.Coordinates{property.LatLngHeight{Lng: -115, Lat: 32, Height: 0}}, property.Coordinates{property.LatLngHeight{Lng: -107, Lat: 33, Height: 0}}, property.Coordinates{property.LatLngHeight{Lng: -102, Lat: 31, Height: 0}}, property.Coordinates{property.LatLngHeight{Lng: -102, Lat: 35, Height: 0}}}
	assert.Equal(t, f3.Value().Value(), plist2)
	fill, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "fill"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, true, fill.Value().Value())
	stroke, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "stroke"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, true, stroke.Value().Value())
	fillColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "fillColor"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, "40be2090", fillColor.Value().Value())
	strokeColor2, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "strokeColor"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, "6f99e000", strokeColor2.Value().Value())
	strokeWidth2, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "strokeWidth"))
	assert.Equal(t, plist, f2.Value().Value())
	assert.Equal(t, 4.0, strokeWidth2.Value().Value())
}
