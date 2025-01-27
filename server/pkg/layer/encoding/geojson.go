package encoding

import (
	"errors"
	"io"

	"github.com/reearth/orb"
	"github.com/reearth/orb/geojson"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	"github.com/reearth/reearth/server/pkg/property"
)

type GeoJSONEncoder struct {
	writer io.Writer
}

func NewGeoJSONEncoder(w io.Writer) *GeoJSONEncoder {
	return &GeoJSONEncoder{
		writer: w,
	}
}

func (*GeoJSONEncoder) MimeType() string {
	return "application/json"
}

func (e *GeoJSONEncoder) polygonToRings(p property.Polygon) []orb.Ring {
	var res []orb.Ring
	for _, c := range p {
		t := e.coordsToPoint(c)
		res = append(res, t)
	}
	return res
}

func (e *GeoJSONEncoder) coordsToPoint(c property.Coordinates) []orb.Point {
	res := []orb.Point{}
	for _, l := range c {
		res = append(res, orb.Point{l.Lng, l.Lat, l.Height})
	}
	return res
}

func (e *GeoJSONEncoder) encodeSingleLayer(li *merging.SealedLayerItem) (*geojson.Feature, error) {
	if li == nil || li.PluginID == nil || !layer.OfficialPluginID.Equal(*li.PluginID) {
		return nil, nil
	}

	var res *geojson.Feature

	switch li.ExtensionID.String() {
	case "marker":
		var coords orb.Point
		if f := li.Property.Field("location").Value().ValueLatLng(); f != nil {
			coords = orb.Point{(*f).Lng, (*f).Lat}
		} else {
			return nil, errors.New("invalid value type")
		}

		if height := li.Property.Field("height").Value().ValueNumber(); height != nil {
			coords = orb.Point{coords[0], coords[1], *height}
		}

		res = geojson.NewFeature(coords)

		if f := li.Property.Field("pointColor").Value().ValueString(); f != nil {
			res.Properties["marker-color"] = *f
		}
	case "polygon":
		if f := li.Property.Field("polygon").Value().ValuePolygon(); f != nil {
			res = geojson.NewFeature(orb.Polygon(e.polygonToRings(*f)))
		} else {
			return nil, errors.New("invalid value type")
		}

		if f := li.Property.Field("fillColor").Value().ValueString(); f != nil {
			res.Properties["fill"] = *f
		}

		if f := li.Property.Field("strokeColor").Value().ValueString(); f != nil {
			res.Properties["stroke"] = *f
		}

		if f := li.Property.Field("strokeWidth").Value().ValueNumber(); f != nil {
			res.Properties["stroke-width"] = *f
		}
	case "polyline":
		if f := li.Property.Field("coordinates").Value().ValueCoordinates(); f != nil {
			res = geojson.NewFeature(orb.LineString(e.coordsToPoint(*f)))
		} else {
			return nil, errors.New("invalid value type")
		}

		if f := li.Property.Field("strokeColor").Value().ValueString(); f != nil {
			res.Properties["stroke"] = *f
		}

		if f := li.Property.Field("strokeWidth").Value().ValueNumber(); f != nil {
			res.Properties["stroke-width"] = *f
		}
	}

	if res != nil {
		res.Properties["name"] = li.Name
	}
	return res, nil
}

func (e *GeoJSONEncoder) encodeLayerGroup(li *merging.SealedLayerGroup) (*geojson.FeatureCollection, error) {
	layers := geojson.NewFeatureCollection()
	for _, ch := range li.Flatten() {
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
			layers.Append(l)
		}
	}
	return layers, nil
}

func (e *GeoJSONEncoder) Encode(layer merging.SealedLayer) error {
	var data []byte
	if i, ok := layer.(*merging.SealedLayerItem); ok {
		geo, err := e.encodeSingleLayer(i)
		if err != nil {
			return err
		}
		if geo != nil {
			data, err = geo.MarshalJSON()
			if err != nil {
				return err
			}
		}
	} else if g, ok := layer.(*merging.SealedLayerGroup); ok {
		fc, err := e.encodeLayerGroup(g)
		if err != nil {
			return err
		}
		if fc != nil {
			data, err = fc.MarshalJSON()
			if err != nil {
				return err
			}
		}
	}
	if len(data) > 0 {
		_, err := e.writer.Write(data)
		if err != nil {
			return err
		}
	}
	return nil
}
