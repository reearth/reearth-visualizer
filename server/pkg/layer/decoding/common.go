package decoding

import (
	"errors"
	"fmt"
	"math"

	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/czml"
	"github.com/reearth/reearth/server/pkg/kml"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
)

var (
	ErrBadColor  = errors.New("bad color")
	ErrFieldType = errors.New("incompatible field Type")
)

var (
	extensions = map[string]layer.PluginExtensionID{
		"Point":    layer.PluginExtensionID("marker"),
		"Polygon":  layer.PluginExtensionID("polygon"),
		"Polyline": layer.PluginExtensionID("polyline"),
	}
	propertySchemas = map[string]property.SchemaID{
		"Point":    property.MustSchemaID("reearth/marker"),
		"Polygon":  property.MustSchemaID("reearth/polygon"),
		"Polyline": property.MustSchemaID("reearth/polyline"),
	}
	propertyItems  = property.SchemaGroupID("default")
	propertyFields = map[string]property.FieldID{
		"Point":    property.FieldID("location"),
		"Polygon":  property.FieldID("polygon"),
		"Polyline": property.FieldID("coordinates"),
	}
)

func rgbaToHex(rgba []int64) (string, error) {
	hex := ""
	if len(rgba) != 4 {
		return "", ErrBadColor
	}
	for _, i := range rgba {
		if i > 255 || i < 0 {
			return "", ErrBadColor
		}
		h := fmt.Sprintf("%x", i)
		if len(h) == 1 {
			h += "0"
		}
		hex += h
	}
	return hex, nil
}

func rgbafToHex(rgbaf []float64) (string, error) {
	var rgba []int64
	if len(rgbaf) != 4 {
		return "", ErrBadColor
	}
	for _, f := range rgbaf {
		var i int64
		if f > 1.0 {
			return "", ErrBadColor
		} else if f == 1.0 {
			i = 255
		} else {
			i = int64(math.Floor(f * 256))
		}

		rgba = append(rgba, i)
	}
	return rgbaToHex(rgba)
}

func MustCreateProperty(t string, v interface{}, sceneID layer.SceneID, styleItem interface{}, extension string) *property.Property {
	p, err := createProperty(t, v, sceneID, styleItem, extension)
	if err != nil {
		panic(err)
	}
	return p
}

func createProperty(t string, v interface{}, sceneID layer.SceneID, styleItem interface{}, extension string) (*property.Property, error) {
	propertySchema := propertySchemas[t]
	item := propertyItems
	field := propertyFields[t]
	ps := builtin.GetPropertySchema(propertySchema)
	p, err := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchema).
		Build()
	if err != nil {
		return nil, err
	}
	f, _, _, _ := p.GetOrCreateField(
		ps,
		property.PointFieldBySchemaGroup(item, field),
	)

	switch t {
	case "Point":
		if pf, ok := v.(property.LatLngHeight); ok {
			v2 := property.ValueTypeLatLng.ValueFrom(&property.LatLng{Lat: pf.Lat, Lng: pf.Lng})
			if v2 == nil {
				return nil, ErrFieldType
			}
			f.UpdateUnsafe(v2)

			v3 := property.ValueTypeNumber.ValueFrom(pf.Height)
			if v3 == nil {
				return nil, ErrFieldType
			}
			f2, _, _, _ := p.GetOrCreateField(
				ps,
				property.PointFieldBySchemaGroup(item, "height"),
			)

			f2.UpdateUnsafe(v3)
		} else if pf, ok := v.(property.LatLng); ok {
			v2 := property.ValueTypeLatLng.ValueFrom(&property.LatLng{Lat: pf.Lat, Lng: pf.Lng})
			if v2 == nil {
				return nil, ErrFieldType
			}
			f.UpdateUnsafe(v2)
		}
		if styleItem != nil {
			switch extension {
			case "kml":
				s, ok := styleItem.(kml.Style)
				if !ok && styleItem != nil {
					return nil, ErrFieldType
				}
				if s.IconStyle.Icon != nil && len(s.IconStyle.Icon.Href) > 0 {
					imageValue := property.ValueTypeURL.ValueFrom(s.IconStyle.Icon.Href)
					if imageValue == nil {
						return nil, ErrFieldType
					}
					imageField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "image"),
					)
					imageField.UpdateUnsafe(imageValue)
				}
				if s.IconStyle.Scale != 0 {
					scaleValue := property.ValueTypeNumber.ValueFrom(s.IconStyle.Scale)
					if scaleValue == nil {
						return nil, ErrFieldType
					}
					scaleField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "imageSize"),
					)
					scaleField.UpdateUnsafe(scaleValue)
				}
				if len(s.IconStyle.Color) > 0 {
					colorValue := property.ValueTypeString.ValueFrom(s.IconStyle.Color)
					if colorValue == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "pointColor"),
					)
					colorField.UpdateUnsafe(colorValue)
				}
			case "geojson":
				s, ok := styleItem.(string)
				if !ok {
					return nil, ErrFieldType
				}
				if len(s) > 0 {
					colorValue := property.ValueTypeString.ValueFrom(s)
					if colorValue == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "pointColor"),
					)
					colorField.UpdateUnsafe(colorValue)
				}
			case "czml":
				s, ok := styleItem.(*czml.Point)
				if !ok {
					return nil, ErrFieldType
				}
				if len(s.Color) > 0 {
					colorValue := property.ValueTypeString.ValueFrom(s.Color)
					if colorValue == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "pointColor"),
					)
					colorField.UpdateUnsafe(colorValue)
				}
				if s.PixelSize != 0 {
					sizeValue := property.ValueTypeNumber.ValueFrom(s.PixelSize)
					if sizeValue == nil {
						return nil, ErrFieldType
					}
					sizeField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "pointSize"),
					)
					sizeField.UpdateUnsafe(sizeValue)
				}
			}
		}
	case "Polygon":
		v2 := property.ValueTypePolygon.ValueFrom(v)
		if v2 == nil {
			return nil, ErrFieldType
		}
		f.UpdateUnsafe(v2)
		if styleItem != nil {
			switch extension {
			case "kml":
				s, ok := styleItem.(kml.Style)
				if !ok && styleItem != nil {
					return nil, ErrFieldType
				}
				if s.PolyStyle.Stroke {
					stroke := property.ValueTypeBool.ValueFrom(s.PolyStyle.Stroke)
					if stroke == nil {
						return nil, ErrFieldType
					}
					strokeField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "stroke"),
					)
					strokeField.UpdateUnsafe(stroke)
				}
				if s.LineStyle.Width != 0 {
					width := property.ValueTypeNumber.ValueFrom(s.LineStyle.Width)
					if width == nil {
						return nil, ErrFieldType
					}
					widthField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeWidth"),
					)
					widthField.UpdateUnsafe(width)
				}
				if len(s.LineStyle.Color) > 0 {
					color := property.ValueTypeString.ValueFrom(s.LineStyle.Color)
					if color == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeColor"),
					)
					colorField.UpdateUnsafe(color)
				}
				if s.PolyStyle.Fill {
					fill := property.ValueTypeBool.ValueFrom(s.PolyStyle.Fill)
					if fill == nil {
						return nil, ErrFieldType
					}
					fillField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "fill"),
					)
					fillField.UpdateUnsafe(fill)
				}
				if len(s.PolyStyle.Color) > 0 {
					color := property.ValueTypeString.ValueFrom(s.PolyStyle.Color)
					if color == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "fillColor"),
					)
					colorField.UpdateUnsafe(color)
				}

			case "czml":
				s, ok := styleItem.(*czml.Polygon)
				if !ok && styleItem != nil {
					return nil, ErrFieldType
				}
				if s.Stroke {
					stroke := property.ValueTypeBool.ValueFrom(s.Stroke)
					if stroke == nil {
						return nil, ErrFieldType
					}
					strokeField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "stroke"),
					)
					strokeField.UpdateUnsafe(stroke)
				}
				if s.StrokeWidth != 0 {
					width := property.ValueTypeNumber.ValueFrom(s.StrokeWidth)
					if width == nil {
						return nil, ErrFieldType
					}
					widthField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeWidth"),
					)
					widthField.UpdateUnsafe(width)
				}
				if s.StrokeColor != nil {
					var colorValue string
					var err error
					if len(s.StrokeColor.RGBA) > 0 {
						colorValue, err = rgbaToHex(s.StrokeColor.RGBA)
						if err != nil {
							return nil, err
						}
					}
					if len(s.StrokeColor.RGBAF) > 0 {
						colorValue, err = rgbafToHex(s.StrokeColor.RGBAF)
						if err != nil {
							return nil, err
						}
					}
					color := property.ValueTypeString.ValueFrom(colorValue)
					if color == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeColor"),
					)
					colorField.UpdateUnsafe(color)
				}
				if s.Fill {
					fill := property.ValueTypeBool.ValueFrom(s.Fill)
					if fill == nil {
						return nil, ErrFieldType
					}
					fillField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "fill"),
					)
					fillField.UpdateUnsafe(fill)
				}
				if s.Material.SolidColor.Color != nil {
					var colorValue string
					var err error
					if len(s.Material.SolidColor.Color.RGBA) > 0 {
						colorValue, err = rgbaToHex(s.Material.SolidColor.Color.RGBA)
						if err != nil {
							return nil, err
						}
					}
					if len(s.Material.SolidColor.Color.RGBAF) > 0 {
						colorValue, err = rgbafToHex(s.Material.SolidColor.Color.RGBAF)
						if err != nil {
							return nil, err
						}
					}
					color := property.ValueTypeString.ValueFrom(colorValue)
					if color == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "fillColor"),
					)
					colorField.UpdateUnsafe(color)
				}
			case "geojson":
				s, ok := styleItem.(GeoStyle)
				if !ok && styleItem != nil {
					return nil, ErrFieldType
				}

				if s.StrokeWidth > 0 {
					width := property.ValueTypeNumber.ValueFrom(s.StrokeWidth)
					if width == nil {
						return nil, ErrFieldType
					}
					widthField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeWidth"),
					)
					widthField.UpdateUnsafe(width)
				}

				if len(s.FillColor) > 0 {
					fill := property.ValueTypeString.ValueFrom(s.FillColor)
					if fill == nil {
						return nil, ErrFieldType
					}
					fillField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "fillColor"),
					)
					fillField.UpdateUnsafe(fill)
				}

				if len(s.StrokeColor) > 0 {
					color := property.ValueTypeString.ValueFrom(s.StrokeColor)
					if color == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeColor"),
					)
					colorField.UpdateUnsafe(color)
				}
			}
		}
	case "Polyline":
		v2 := property.ValueTypeCoordinates.ValueFrom(v)
		if v2 == nil {
			return nil, ErrFieldType
		}
		f.UpdateUnsafe(v2)
		if styleItem != nil {
			switch extension {
			case "kml":
				s, ok := styleItem.(kml.Style)
				if !ok && styleItem != nil {
					return nil, ErrFieldType
				}

				if len(s.LineStyle.Color) > 0 {
					color := property.ValueTypeString.ValueFrom(s.LineStyle.Color)
					if color == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeColor"),
					)
					colorField.UpdateUnsafe(color)
				}

				if s.LineStyle.Width != 0 {
					width := property.ValueTypeNumber.ValueFrom(s.LineStyle.Width)
					if width == nil {
						return nil, ErrFieldType
					}
					widthField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeWidth"),
					)
					widthField.UpdateUnsafe(width)
				}
			case "czml":
				s, ok := styleItem.(*czml.Polyline)
				if !ok && styleItem != nil {
					return nil, ErrFieldType
				}

				if s.Width != 0 {
					width := property.ValueTypeNumber.ValueFrom(s.Width)
					if width == nil {
						return nil, ErrFieldType
					}
					widthField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeWidth"),
					)
					widthField.UpdateUnsafe(width)
				}

				if s.Material.PolylineOutline.Color != nil {
					var colorValue string
					var err error

					if len(s.Material.PolylineOutline.Color.RGBA) > 0 {
						colorValue, err = rgbaToHex(s.Material.PolylineOutline.Color.RGBA)
						if err != nil {
							return nil, err
						}
					}

					if len(s.Material.PolylineOutline.Color.RGBAF) > 0 {
						colorValue, err = rgbafToHex(s.Material.PolylineOutline.Color.RGBAF)
						if err != nil {
							return nil, err
						}
					}

					color := property.ValueTypeString.ValueFrom(colorValue)
					if color == nil {
						return nil, ErrFieldType
					}

					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeColor"),
					)
					colorField.UpdateUnsafe(color)
				}
			case "geojson":
				s, ok := styleItem.(GeoStyle)
				if !ok && styleItem != nil {
					return nil, ErrFieldType
				}

				if s.StrokeWidth > 0 {
					width := property.ValueTypeNumber.ValueFrom(s.StrokeWidth)
					if width == nil {
						return nil, ErrFieldType
					}
					widthField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeWidth"),
					)
					widthField.UpdateUnsafe(width)
				}

				if len(s.StrokeColor) > 0 {
					color := property.ValueTypeString.ValueFrom(s.StrokeColor)
					if color == nil {
						return nil, ErrFieldType
					}
					colorField, _, _, _ := p.GetOrCreateField(
						ps,
						property.PointFieldBySchemaGroup(item, "strokeColor"),
					)
					colorField.UpdateUnsafe(color)
				}
			}
		}
	}

	return p, nil
}
