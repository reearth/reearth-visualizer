package encoding

import (
	"errors"
	"io"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
)

type GeoJSONEncoder struct {
	writer io.Writer
}

func NewGeoJSONEncoder(w io.Writer) *GeoJSONEncoder {
	return &GeoJSONEncoder{
		writer: w,
	}
}

func (e *GeoJSONEncoder) polygonToFloat(p property.Polygon) [][][]float64 {
	var res [][][]float64
	for _, c := range p {
		t := e.coordsToFloat(c)
		res = append(res, t)
	}
	return res
}

func (e *GeoJSONEncoder) coordsToFloat(c property.Coordinates) [][]float64 {
	var res [][]float64
	for _, l := range c {
		t := []float64{}
		t = append(t, []float64{l.Lng, l.Lat, l.Height}...)
		res = append(res, t)
	}
	return res
}

func (e *GeoJSONEncoder) encodeSingleLayer(li *merging.SealedLayerItem) (*geojson.Feature, error) {
	if li.PluginID == nil || !id.OfficialPluginID.Equal(*li.PluginID) {
		return nil, nil
	}

	var ok bool
	var geo *geojson.Geometry
	var res *geojson.Feature
	switch li.ExtensionID.String() {
	case "marker":
		latlng := property.LatLng{}
		var height float64
		if f := li.Property.Field("location"); f != nil {
			latlng, ok = f.PropertyValue.ValueLatLng()
			if !ok {
				dsll := f.DatasetValue.ValueLatLng()
				if dsll != nil {
					latlng = property.LatLng{
						Lat: dsll.Lat,
						Lng: dsll.Lng,
					}
				} else {
					return nil, errors.New("invalid value type")
				}
			}
			if f := li.Property.Field("height"); f != nil {
				height, ok = f.PropertyValue.ValueNumber()
				if !ok {
					dsHeight := f.DatasetValue.ValueNumber()
					if dsHeight != nil {
						height = *dsHeight
					} else {
						return nil, errors.New("invalid value type")
					}
				}
				geo = geojson.NewPointGeometry([]float64{latlng.Lng, latlng.Lat, height})
			} else {
				geo = geojson.NewPointGeometry([]float64{latlng.Lng, latlng.Lat})
			}
			res = geojson.NewFeature(geo)
			res.SetProperty("name", li.Name)
		}
		if f := li.Property.Field("pointColor"); f != nil {
			pointColor, ok := f.PropertyValue.ValueString()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			if res != nil {
				res.SetProperty("marker-color", pointColor)
			}
		}
	case "polygon":
		var polygon property.Polygon
		if f := li.Property.Field("polygon"); f != nil {
			polygon, ok = f.PropertyValue.ValuePolygon()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			fl := e.polygonToFloat(polygon)

			geo = geojson.NewPolygonGeometry(fl)
			res = geojson.NewFeature(geo)
			res.SetProperty("name", li.Name)
		}
		if f := li.Property.Field("fillColor"); f != nil {
			fillColor, ok := f.PropertyValue.ValueString()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			if res != nil {
				res.SetProperty("fill", fillColor)
			}
		}
		if f := li.Property.Field("strokeColor"); f != nil {
			strokeColor, ok := f.PropertyValue.ValueString()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			if res != nil {
				res.SetProperty("stroke", strokeColor)
			}
		}
		if f := li.Property.Field("strokeWidth"); f != nil {
			strokeWidth, ok := f.PropertyValue.ValueNumber()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			if res != nil {
				res.SetProperty("stroke-width", strokeWidth)
			}
		}
	case "polyline":
		var polyline property.Coordinates
		if f := li.Property.Field("coordinates"); f != nil {
			polyline, ok = f.PropertyValue.ValueCoordinates()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			fl := e.coordsToFloat(polyline)
			geo = geojson.NewLineStringGeometry(fl)
			res = geojson.NewFeature(geo)
			res.SetProperty("name", li.Name)
		}
		if f := li.Property.Field("strokeColor"); f != nil {
			strokeColor, ok := f.PropertyValue.ValueString()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			if res != nil {
				res.SetProperty("stroke", strokeColor)
			}
		}
		if f := li.Property.Field("strokeWidth"); f != nil {
			strokeWidth, ok := f.PropertyValue.ValueNumber()
			if !ok {
				return nil, errors.New("invalid value type")
			}
			if res != nil {
				res.SetProperty("stroke-width", strokeWidth)
			}
		}
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
			layers.AddFeature(l)
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
