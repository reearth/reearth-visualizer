package encoding

import (
	"encoding/json"
	"errors"
	"io"

	"github.com/reearth/reearth-backend/pkg/czml"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
)

type CZMLEncoder struct {
	writer io.Writer
}

func NewCZMLEncoder(w io.Writer) *CZMLEncoder {
	return &CZMLEncoder{
		writer: w,
	}
}

func (e *CZMLEncoder) stringToCZMLColor(s string) (*czml.Color, error) {
	c, err := getColor(s)
	if err != nil || c == nil {
		if err == nil {
			err = ErrInvalidColor
		}
		return nil, err
	}
	return &czml.Color{
		RGBA: []int64{int64(c.R), int64(c.G), int64(c.B), int64(c.A)},
	}, nil
}

func (e *CZMLEncoder) encodeSingleLayer(li *merging.SealedLayerItem) (*czml.Feature, error) {
	if li.PluginID == nil || !id.OfficialPluginID.Equal(*li.PluginID) {
		return nil, nil
	}

	var ok bool
	var err error
	var pointSize float64
	var pointColor string
	feature := czml.Feature{
		Id:    "",
		Name:  "",
		Point: nil,
	}
	feature.Name = li.Name
	switch li.ExtensionID.String() {
	case "marker":
		latlng := property.LatLng{}
		var height float64
		if li.Property.Field("location") != nil {
			latlng, ok = li.Property.Field("location").PropertyValue.ValueLatLng()
			if !ok {
				return nil, errors.New("invalid value type")
			}

			if li.Property.Field("height") != nil {
				height, ok = li.Property.Field("height").PropertyValue.ValueNumber()
				if !ok {
					return nil, errors.New("invalid value type")
				}
				position := czml.Position{
					CartographicDegrees: []float64{latlng.Lng, latlng.Lat, height},
				}
				feature.Position = &position
			} else {
				position := czml.Position{
					CartographicDegrees: []float64{latlng.Lng, latlng.Lat},
				}
				feature.Position = &position
			}
		}
		if li.Property.Field("pointColor") != nil {
			pointColor, ok = li.Property.Field("pointColor").PropertyValue.ValueString()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		if li.Property.Field("pointSize") != nil {
			pointSize, ok = li.Property.Field("pointSize").PropertyValue.ValueNumber()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		if pointSize != 0 || len(pointColor) > 0 {
			point := czml.Point{
				Color:     pointColor,
				PixelSize: pointSize,
			}
			feature.Point = &point
		}
	case "polygon":
		var polygon property.Polygon
		position := czml.Position{}
		var fill, stroke bool
		var fillColor, strokeColor *czml.Color
		var strokeWidth float64
		if li.Property.Field("polygon") != nil {
			polygon, ok = li.Property.Field("polygon").PropertyValue.ValuePolygon()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			for _, c := range polygon {
				for _, l := range c {
					position.CartographicDegrees = append(position.CartographicDegrees, []float64{l.Lng, l.Lat, l.Height}...)
				}
			}
		}
		if li.Property.Field("fill") != nil {
			fill, ok = li.Property.Field("fill").PropertyValue.ValueBool()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		if li.Property.Field("stroke") != nil {
			stroke, ok = li.Property.Field("stroke").PropertyValue.ValueBool()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		if li.Property.Field("fillColor") != nil {
			fillStr, ok := li.Property.Field("fillColor").PropertyValue.ValueString()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			fillColor, err = e.stringToCZMLColor(fillStr)
			if err != nil {
				return nil, err
			}
		}
		if li.Property.Field("strokeColor") != nil {
			strokeStr, ok := li.Property.Field("strokeColor").PropertyValue.ValueString()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			strokeColor, err = e.stringToCZMLColor(strokeStr)
			if err != nil {
				return nil, err
			}
		}
		if li.Property.Field("strokeWidth") != nil {
			strokeWidth, ok = li.Property.Field("strokeWidth").PropertyValue.ValueNumber()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		polygonCZML := czml.Polygon{
			Positions:   position,
			Fill:        fill,
			Material:    &czml.Material{SolidColor: &czml.SolidColor{Color: fillColor}},
			Stroke:      stroke,
			StrokeColor: strokeColor,
			StrokeWidth: strokeWidth,
		}
		feature.Polygon = &polygonCZML
	case "polyline":
		var polyline property.Coordinates
		position := czml.Position{}
		var strokeColor *czml.Color
		var strokeWidth float64
		if li.Property.Field("coordinates") != nil {
			polyline, ok = li.Property.Field("coordinates").PropertyValue.ValueCoordinates()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			for _, l := range polyline {
				position.CartographicDegrees = append(position.CartographicDegrees, []float64{l.Lng, l.Lat, l.Height}...)
			}
		}

		if li.Property.Field("strokeColor") != nil {
			strokeStr, ok := li.Property.Field("strokeColor").PropertyValue.ValueString()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			strokeColor, err = e.stringToCZMLColor(strokeStr)
			if err != nil {
				return nil, err
			}
		}
		if li.Property.Field("strokeWidth") != nil {
			strokeWidth, ok = li.Property.Field("strokeWidth").PropertyValue.ValueNumber()
			if !ok {
				return nil, errors.New("invalid value type")
			}
		}
		polylineCZML := czml.Polyline{
			Positions: position,
			Material: &czml.Material{
				PolylineOutline: &czml.PolylineOutline{Color: strokeColor},
			},
			Width: strokeWidth,
		}
		feature.Polyline = &polylineCZML

	}
	return &feature, nil
}

func (e *CZMLEncoder) encodeLayerGroup(li *merging.SealedLayerGroup) ([]*czml.Feature, error) {
	groupFeature := czml.Feature{
		Id:   "",
		Name: "",
	}
	groupFeature.Id = "document"
	groupFeature.Name = li.Name
	res := []*czml.Feature{}
	res = append(res, &groupFeature)

	for _, ch := range li.Children {
		sl := merging.SealedLayerItem{
			SealedLayerCommon: merging.SealedLayerCommon{
				Merged:   ch.Common().Merged,
				Property: ch.Common().Property,
				Infobox:  ch.Common().Infobox,
			},
		}
		l, err := e.encodeSingleLayer(&sl)
		if err != nil {
			return nil, err
		}
		if l != nil {
			res = append(res, l)
		}
	}

	return res, nil
}

func (e *CZMLEncoder) Encode(layer merging.SealedLayer) error {
	var res []*czml.Feature
	var err error
	if i, ok := layer.(*merging.SealedLayerItem); ok {
		feature, err := e.encodeSingleLayer(i)
		if err != nil {
			return err
		}
		res = append(res, feature)

	} else if g, ok := layer.(*merging.SealedLayerGroup); ok {
		res, err = e.encodeLayerGroup(g)
		if err != nil {
			return err
		}
	}
	en := json.NewEncoder(e.writer)
	err = en.Encode(res)
	if err != nil {
		return err
	}
	return nil
}
