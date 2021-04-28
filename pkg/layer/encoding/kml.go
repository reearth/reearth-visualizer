package encoding

import (
	"errors"
	"image/color"
	"io"
	"math/rand"
	"net/url"
	"strings"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	kml "github.com/twpayne/go-kml"
)

type KMLEncoder struct {
	writer io.Writer
	styles []*kml.SharedElement
}

func NewKMLEncoder(w io.Writer) *KMLEncoder {
	return &KMLEncoder{
		writer: w,
	}
}

// generates a composite string of layer name and id to be used as style tag id
func (e *KMLEncoder) generateStyleId(id string, name string) (string, error) {
	if len(id) > 0 {
		subid := id[len(id)-5:]
		trimmedName := ""
		if len(name) > 0 {
			trimmedName = strings.Join(strings.Fields(name), "") + "_"

		}
		b := make([]byte, 8)
		if _, err := rand.Read(b); err != nil {
			return "", err
		}
		return trimmedName + subid, nil
	}

	return "", nil
}

func (e *KMLEncoder) getName(str string) *kml.SimpleElement {
	return kml.Name(str)
}

// encodes style features and return style kml element and used id
func (e *KMLEncoder) encodePointStyle(li *merging.SealedLayerItem) (*kml.SharedElement, string, error) {
	var image *url.URL
	var styleId string
	var err error
	var ok bool
	var imageSize float64
	var pointColor color.Color
	if li.Property.Field("image") != nil {
		if li.Property.Field("image").PropertyValue != nil {
			image, ok = li.Property.Field("image").PropertyValue.ValueURL()
			if !ok {
				return nil, "", errors.New("invalid value type")
			}
			if len(image.String()) == 0 {
				return nil, "", errors.New("empty URL")
			}
		}
	}
	if li.Property.Field("imageSize") != nil {
		imageSize, ok = li.Property.Field("imageSize").PropertyValue.ValueNumber()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
	}
	if li.Property.Field("pointColor") != nil {
		colorStr, ok := li.Property.Field("pointColor").PropertyValue.ValueString()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
		pointColor, err = getColor(colorStr)
		if err != nil {
			return nil, "", err
		}
	}
	styleId, err = e.generateStyleId(li.Original.String(), li.Name)
	if err != nil {
		return nil, "", err
	}
	if imageSize != 0 || pointColor != nil || (image != nil && len(image.String()) > 0) {
		iconStyle := kml.IconStyle()
		if imageSize != 0 {
			iconStyle.Add(kml.Scale(imageSize))
		}
		if pointColor != nil {
			iconStyle.Add(kml.Color(pointColor))
		}
		if image != nil {
			iconStyle.Add(kml.Icon(
				kml.Href(image.String())))
		}
		return kml.SharedStyle(styleId, iconStyle), styleId, nil
	}
	return nil, "", nil
}

func (e *KMLEncoder) encodePolygonStyle(li *merging.SealedLayerItem) (*kml.SharedElement, string, error) {
	var styleId string
	var fill, stroke bool
	var fillColor, strokeColor color.Color
	var strokeWidth float64
	var err error
	var ok bool
	if li.Property.Field("fill") != nil {
		fill, ok = li.Property.Field("fill").PropertyValue.ValueBool()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
	}
	if li.Property.Field("stroke") != nil {
		stroke, ok = li.Property.Field("stroke").PropertyValue.ValueBool()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
	}

	if li.Property.Field("fillColor") != nil {
		colorStr, ok := li.Property.Field("fillColor").PropertyValue.ValueString()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
		fillColor, err = getColor(colorStr)
		if err != nil {
			return nil, "", err
		}
	}
	if li.Property.Field("strokeColor") != nil {
		colorStr, ok := li.Property.Field("strokeColor").PropertyValue.ValueString()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
		strokeColor, err = getColor(colorStr)
		if err != nil {
			return nil, "", err
		}
	}
	if li.Property.Field("strokeWidth") != nil {
		strokeWidth, ok = li.Property.Field("strokeWidth").PropertyValue.ValueNumber()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
	}
	styleId, err = e.generateStyleId(li.Original.String(), li.Name)
	if err != nil {
		return nil, "", err
	}
	polyStyle := kml.PolyStyle()
	lineStyle := kml.LineStyle()
	if fill || fillColor != nil {
		if fill {
			polyStyle.Add(kml.Fill(fill))
		}
		if fillColor != nil {
			polyStyle.Add(kml.Color(fillColor))
		}
	}
	if stroke || strokeColor != nil || strokeWidth != 0 {
		if stroke {
			lineStyle.Add(kml.Outline(stroke))
		}
		if strokeColor != nil {
			lineStyle.Add(kml.Color(strokeColor))
		}
		if strokeWidth != 0 {
			lineStyle.Add(kml.Width(strokeWidth))
		}
	}
	style := kml.SharedStyle(styleId)
	if polyStyle != nil {
		style.Add(polyStyle)
	}
	if lineStyle != nil {
		style.Add(lineStyle)
	}
	return style, styleId, nil
}

func (e *KMLEncoder) encodePolylineStyle(li *merging.SealedLayerItem) (*kml.SharedElement, string, error) {
	var styleId string
	var strokeColor color.Color
	var strokeWidth float64
	var err error
	var ok bool

	if li.Property.Field("strokeColor") != nil {
		colorStr, ok := li.Property.Field("strokeColor").PropertyValue.ValueString()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
		strokeColor, err = getColor(colorStr)
		if err != nil {
			return nil, "", err
		}
	}
	if li.Property.Field("strokeWidth") != nil {
		strokeWidth, ok = li.Property.Field("strokeWidth").PropertyValue.ValueNumber()
		if !ok {
			return nil, "", errors.New("invalid value type")
		}
	}
	styleId, err = e.generateStyleId(li.Original.String(), li.Name)
	if err != nil {
		return nil, "", err
	}
	lineStyle := kml.LineStyle()
	if strokeColor != nil || strokeWidth != 0 {
		if strokeColor != nil {
			lineStyle.Add(kml.Color(strokeColor))
		}
		if strokeWidth != 0 {
			lineStyle.Add(kml.Width(strokeWidth))
		}
	}
	style := kml.SharedStyle(styleId)
	if lineStyle != nil {
		style.Add(lineStyle)
	}
	return style, styleId, nil
}

func (e *KMLEncoder) encodeStyle(li *merging.SealedLayerItem) (*kml.SharedElement, string, error) {
	switch li.ExtensionID.String() {
	case "marker":
		return e.encodePointStyle(li)
	case "polygon":
		return e.encodePolygonStyle(li)
	case "polyline":
		return e.encodePolylineStyle(li)
	}
	return nil, "", nil
}

// encodes non style layer features
func (e *KMLEncoder) encodeLayerTag(li *merging.SealedLayerItem) (*kml.CompoundElement, error) {
	if li.PluginID == nil || !id.OfficialPluginID.Equal(*li.PluginID) {
		return nil, nil
	}

	var layerTag *kml.CompoundElement
	var ok bool
	name := e.getName(li.Name)
	switch li.ExtensionID.String() {
	case "marker":
		layerTag = kml.Point()
		latlng := property.LatLng{}
		var height float64
		if li.Property.Field("location") != nil {
			latlng, ok = li.Property.Field("location").PropertyValue.ValueLatLng()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		if li.Property.Field("height") != nil {
			height, ok = li.Property.Field("height").PropertyValue.ValueNumber()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		layerTag = layerTag.Add(
			kml.Coordinates(
				kml.Coordinate{
					Lon: latlng.Lng,
					Lat: latlng.Lat,
					Alt: height,
				}))
	case "polygon":
		layerTag = kml.Polygon()
		polygon := property.Polygon{}
		if li.Property.Field("polygon") != nil {
			polygon, ok = li.Property.Field("polygon").PropertyValue.ValuePolygon()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		// by default, first polygon coords set is for outer boundaries... the second is for inner
		if len(polygon) > 0 {
			var coords []kml.Coordinate
			for _, c := range polygon[0] {
				coords = append(coords, kml.Coordinate{
					Lon: c.Lng,
					Lat: c.Lat,
					Alt: c.Height,
				})
			}
			layerTag = layerTag.Add(kml.OuterBoundaryIs(kml.LinearRing(kml.Coordinates(coords...))))
		}
		//encode inner boundaries
		if len(polygon) == 2 {
			var coords []kml.Coordinate
			for _, c := range polygon[1] {
				coords = append(coords, kml.Coordinate{
					Lon: c.Lng,
					Lat: c.Lat,
					Alt: c.Height,
				})
			}
			layerTag.Add(kml.InnerBoundaryIs(kml.LinearRing(kml.Coordinates(coords...))))
		}
	case "polyline":
		layerTag = kml.LineString()
		polyline := property.Coordinates{}
		if li.Property.Field("coordinates") != nil {
			polyline, ok = li.Property.Field("coordinates").PropertyValue.ValueCoordinates()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		if len(polyline) > 0 {
			var coords []kml.Coordinate
			for _, c := range polyline {
				coords = append(coords, kml.Coordinate{
					Lon: c.Lng,
					Lat: c.Lat,
					Alt: c.Height,
				})
			}
			layerTag = layerTag.Add(kml.Coordinates(coords...))
		}
	}
	placemark := kml.Placemark()
	if len(li.Name) != 0 {
		placemark.Add(name)
	}
	placemark = placemark.Add(layerTag)

	return placemark, nil
}

func (e *KMLEncoder) encodeLayerGroup(li *merging.SealedLayerGroup, parent *kml.CompoundElement) (*kml.CompoundElement, error) {
	name := e.getName(li.Name)
	if len(li.Name) != 0 {
		parent.Add(name)
	}

	for _, ch := range li.Children {
		if g, ok := ch.(*merging.SealedLayerGroup); ok {
			folder := kml.Folder()

			folder, err := e.encodeLayerGroup(g, folder)
			if err != nil {
				return nil, err
			}

			parent.Add(folder)
		} else if i, ok := ch.(*merging.SealedLayerItem); ok {
			placemark, err := e.encodeLayerTag(i)
			if err != nil {
				return nil, err
			}
			if placemark == nil {
				return nil, nil
			}

			style, styleId, err := e.encodeStyle(i)
			if err != nil {
				return nil, err
			}
			if style != nil {
				e.styles = append(e.styles, style)
				placemark.Add(kml.StyleURL("#" + styleId))
			}

			parent = parent.Add(placemark)
		}
	}

	return parent, nil
}

func (e *KMLEncoder) Encode(layer merging.SealedLayer) error {
	var res *kml.CompoundElement
	var err error

	if i, ok := layer.(*merging.SealedLayerItem); ok {
		style, styleId, err := e.encodeStyle(i)
		if err != nil {
			return err
		}
		l, err := e.encodeLayerTag(i)
		if err != nil {
			return err
		}
		if style != nil {
			res = kml.KML(style)
			res = res.Add(l)
			l.Add(kml.StyleURL("#" + styleId))
		} else {
			res = kml.KML(l)
		}
	} else if g, ok := layer.(*merging.SealedLayerGroup); ok {
		doc := kml.Document()

		doc, err := e.encodeLayerGroup(g, doc)
		if err != nil {
			return err
		}
		if len(e.styles) > 0 {
			for _, s := range e.styles {
				doc.Add(s)
			}
		}
		res = kml.KML(doc)
	}

	err = res.WriteIndent(e.writer, "", "  ")
	if err != nil {
		return err
	}
	return nil
}
