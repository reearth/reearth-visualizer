package encoding

import (
	"errors"
	"io"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	kml "github.com/twpayne/go-kml/v3"
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

func (*KMLEncoder) MimeType() string {
	return "application/xml"
}

// generates a composite string of layer name and id to be used as style tag id
func generateKMLStyleId(id string) string {
	return id + "_style"
}

func (e *KMLEncoder) getName(str string) *kml.SimpleElement {
	return kml.Name(str)
}

// encodes style features and return style kml element and used id
func (e *KMLEncoder) encodePointStyle(li *merging.SealedLayerItem) (*kml.SharedElement, string) {
	added := false
	styleId := generateKMLStyleId(li.Original.String())
	iconStyle := kml.IconStyle()

	if f := li.Property.Field("image").Value().ValueURL(); f != nil {
		iconStyle.Add(kml.Icon(kml.Href(f.String())))
		added = true
	}

	if f := li.Property.Field("imageSize").Value().ValueNumber(); f != nil {
		iconStyle.Add(kml.Scale(*f))
		added = true
	}

	if f := li.Property.Field("pointColor").Value().ValueString(); f != nil {
		if c := getColor(*f); c != nil {
			iconStyle.Add(kml.Color(c))
			added = true
		}
	}

	if !added {
		return nil, ""
	}

	return kml.SharedStyle(styleId, iconStyle), styleId
}

func (e *KMLEncoder) encodePolygonStyle(li *merging.SealedLayerItem) (*kml.SharedElement, string) {
	styleId := generateKMLStyleId(li.Original.String())

	var polyStyle, lineStyle *kml.CompoundElement

	if f := li.Property.Field("fill").Value().ValueBool(); f != nil {
		if polyStyle == nil {
			polyStyle = kml.PolyStyle()
		}
		polyStyle.Add(kml.Fill(*f))
	}

	if f := li.Property.Field("fillColor").Value().ValueString(); f != nil {
		if fillColor := getColor(*f); fillColor != nil {
			if polyStyle == nil {
				polyStyle = kml.PolyStyle()
			}
			polyStyle.Add(kml.Color(fillColor))
		}
	}

	if f := li.Property.Field("stroke").Value().ValueBool(); f != nil {
		if lineStyle == nil {
			lineStyle = kml.LineStyle()
		}
		lineStyle.Add(kml.Outline(*f))
	}

	if f := li.Property.Field("strokeColor").Value().ValueString(); f != nil {
		if strokeColor := getColor(*f); lineStyle != nil {
			if lineStyle == nil {
				lineStyle = kml.LineStyle()
			}
			lineStyle.Add(kml.Color(strokeColor))
		}
	}

	if f := li.Property.Field("strokeWidth").Value().ValueNumber(); f != nil {
		if lineStyle == nil {
			lineStyle = kml.LineStyle()
		}
		lineStyle.Add(kml.Width(*f))
	}

	style := kml.SharedStyle(styleId)
	if polyStyle != nil {
		style.Add(polyStyle)
	}
	if lineStyle != nil {
		style.Add(lineStyle)
	}
	return style, styleId
}

func (e *KMLEncoder) encodePolylineStyle(li *merging.SealedLayerItem) (*kml.SharedElement, string) {
	styleId := generateKMLStyleId(li.Original.String())
	style := kml.SharedStyle(styleId)
	var lineStyle *kml.CompoundElement

	if f := li.Property.Field("strokeColor").Value().ValueString(); f != nil {
		if strokeColor := getColor(*f); strokeColor != nil {
			if lineStyle == nil {
				lineStyle = kml.LineStyle()
			}
			lineStyle.Add(kml.Color(strokeColor))
		}
	}

	if f := li.Property.Field("strokeWidth").Value().ValueNumber(); f != nil {
		if lineStyle == nil {
			lineStyle = kml.LineStyle()
		}
		lineStyle.Add(kml.Width(*f))
	}

	if lineStyle != nil {
		style.Add(lineStyle)
	}
	return style, styleId
}

func (e *KMLEncoder) encodeStyle(li *merging.SealedLayerItem) (*kml.SharedElement, string) {
	switch li.ExtensionID.String() {
	case "marker":
		return e.encodePointStyle(li)
	case "polygon":
		return e.encodePolygonStyle(li)
	case "polyline":
		return e.encodePolylineStyle(li)
	}
	return nil, ""
}

// encodes non style layer features
func (e *KMLEncoder) encodeLayerTag(li *merging.SealedLayerItem) (*kml.CompoundElement, error) {
	if li.PluginID == nil || !layer.OfficialPluginID.Equal(*li.PluginID) {
		return nil, nil
	}

	var layerTag *kml.CompoundElement

	switch li.ExtensionID.String() {
	case "marker":
		c := kml.Coordinate{}

		if f := li.Property.Field("location").Value().ValueLatLng(); f != nil {
			c.Lat = (*f).Lat
			c.Lon = (*f).Lng
		} else {
			return nil, errors.New("invalid value type")
		}

		if f := li.Property.Field("height").Value().ValueNumber(); f != nil {
			c.Alt = *f
		}

		layerTag = kml.Point().Add(kml.Coordinates(c))
	case "polygon":
		layerTag = kml.Polygon()
		// polygon := property.Polygon{}
		if f := li.Property.Field("polygon").Value().ValuePolygon(); f != nil && len(*f) > 0 {
			// by default, first polygon coords set is for outer boundaries... the second is for inner
			for i, r := range *f {
				var coords []kml.Coordinate
				for _, c := range r {
					coords = append(coords, kml.Coordinate{
						Lon: c.Lng,
						Lat: c.Lat,
						Alt: c.Height,
					})
				}
				if i == 0 {
					layerTag = layerTag.Add(kml.OuterBoundaryIs(kml.LinearRing(kml.Coordinates(coords...))))
				} else {
					layerTag = layerTag.Add(kml.InnerBoundaryIs(kml.LinearRing(kml.Coordinates(coords...))))
				}
			}
		} else {
			return nil, errors.New("invalid value type")
		}
	case "polyline":
		if f := li.Property.Field("coordinates").Value().ValueCoordinates(); f != nil && len(*f) > 0 {
			coords := make([]kml.Coordinate, 0, len(*f))
			for _, c := range *f {
				coords = append(coords, kml.Coordinate{
					Lon: c.Lng,
					Lat: c.Lat,
					Alt: c.Height,
				})
			}
			layerTag = kml.LineString().Add(kml.Coordinates(coords...))
		} else {
			return nil, errors.New("invalid value type")
		}
	}

	placemark := kml.Placemark()
	if len(li.Name) != 0 {
		placemark.Add(e.getName(li.Name))
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
			parent = parent.Add(folder)
		} else if i, ok := ch.(*merging.SealedLayerItem); ok {
			placemark, err := e.encodeLayerTag(i)
			if err != nil {
				return nil, err
			} else if placemark == nil {
				return nil, nil
			}
			if style, styleId := e.encodeStyle(i); style != nil {
				e.styles = append(e.styles, style)
				placemark.Add(kml.StyleURL("#" + styleId))
			}
			parent = parent.Add(placemark)
		}
	}

	return parent, nil
}

func (e *KMLEncoder) Encode(layer merging.SealedLayer) (err error) {
	var res *kml.CompoundElement

	if i, ok := layer.(*merging.SealedLayerItem); ok {
		style, styleId := e.encodeStyle(i)
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

	if err := res.WriteIndent(e.writer, "", "  "); err != nil {
		return err
	}

	return nil
}
