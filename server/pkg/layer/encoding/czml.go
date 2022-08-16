package encoding

import (
	"encoding/json"
	"errors"
	"io"

	"github.com/reearth/reearth/server/pkg/czml"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
)

type CZMLEncoder struct {
	writer io.Writer
}

func NewCZMLEncoder(w io.Writer) *CZMLEncoder {
	return &CZMLEncoder{
		writer: w,
	}
}

func (*CZMLEncoder) MimeType() string {
	return "application/json"
}

func (e *CZMLEncoder) stringToCZMLColor(s string) *czml.Color {
	c := getColor(s)
	if c == nil {
		return nil
	}
	return &czml.Color{RGBA: []int64{int64(c.R), int64(c.G), int64(c.B), int64(c.A)}}
}

func (e *CZMLEncoder) encodeSingleLayer(li *merging.SealedLayerItem) (*czml.Feature, error) {
	if li.PluginID == nil || !layer.OfficialPluginID.Equal(*li.PluginID) {
		return nil, nil
	}

	feature := czml.Feature{
		Id:   li.Original.String(),
		Name: li.Name,
	}

	switch li.ExtensionID.String() {
	case "marker":
		var position czml.Position
		point := czml.Point{}
		if f := li.Property.Field("location").Value().ValueLatLng(); f != nil {
			position = czml.Position{CartographicDegrees: []float64{(*f).Lng, (*f).Lat}}
		} else {
			return nil, errors.New("invalid value type")
		}

		if f := li.Property.Field("height").Value().ValueNumber(); f != nil {
			position.CartographicDegrees = append(position.CartographicDegrees, *f)
		}

		if f := li.Property.Field("pointColor").Value().ValueString(); f != nil {
			point.Color = *f
		}

		if f := li.Property.Field("pointSize").Value().ValueNumber(); f != nil {
			point.PixelSize = *f
		}

		feature.Position = &position
		feature.Point = &point
	case "polygon":
		polygon := czml.Polygon{}

		if f := li.Property.Field("polygon").Value().ValuePolygon(); f != nil && len(*f) > 0 {
			// CZML polygon does not support multi inner rings
			for _, l := range (*f)[0] {
				polygon.Positions.CartographicDegrees = append(
					polygon.Positions.CartographicDegrees,
					[]float64{l.Lng, l.Lat, l.Height}...,
				)
			}
		} else {
			// polygon is required
			return nil, errors.New("invalid value type")
		}

		if f := li.Property.Field("fill").Value().ValueBool(); f != nil {
			polygon.Fill = *f
		}

		if f := li.Property.Field("stroke").Value().ValueBool(); f != nil {
			polygon.Stroke = *f
		}

		if f := li.Property.Field("fillColor").Value().ValueString(); f != nil {
			if c := e.stringToCZMLColor(*f); c != nil {
				polygon.Material = &czml.Material{SolidColor: &czml.SolidColor{Color: c}}
			}
		}

		if f := li.Property.Field("strokeColor").Value().ValueString(); f != nil {
			if strokeColor := e.stringToCZMLColor(*f); strokeColor != nil {
				polygon.StrokeColor = strokeColor
			}
		}

		if f := li.Property.Field("strokeWidth").Value().ValueNumber(); f != nil {
			polygon.StrokeWidth = *f
		}

		feature.Polygon = &polygon
	case "polyline":
		polyline := czml.Polyline{Positions: czml.Position{}}

		if f := li.Property.Field("coordinates").Value().ValueCoordinates(); f != nil {
			for _, l := range *f {
				polyline.Positions.CartographicDegrees = append(
					polyline.Positions.CartographicDegrees,
					l.Lng, l.Lat, l.Height,
				)
			}
		} else {
			return nil, errors.New("invalid value type")
		}

		if f := li.Property.Field("strokeColor").Value().ValueString(); f != nil {
			if strokeColor := e.stringToCZMLColor(*f); strokeColor != nil {
				polyline.Material = &czml.Material{
					PolylineOutline: &czml.PolylineOutline{Color: strokeColor},
				}
			}
		}

		if f := li.Property.Field("strokeWidth").Value().ValueNumber(); f != nil {
			polyline.Width = *f
		}

		feature.Polyline = &polyline
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

	if err := json.NewEncoder(e.writer).Encode(res); err != nil {
		return err
	}
	return nil
}
