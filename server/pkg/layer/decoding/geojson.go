package decoding

import (
	"errors"
	"fmt"
	"io"

	"github.com/reearth/orb"
	"github.com/reearth/orb/geojson"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
)

type GeoStyle struct {
	StrokeColor string  `json:"stroke"`
	StrokeWidth float64 `json:"stroke-width"`
	FillColor   string  `json:"fill"`
}
type GeoJSONDecoder struct {
	reader    io.Reader
	features  []*geojson.Feature
	sceneId   layer.SceneID
	groupName string
}

func NewGeoJSONDecoder(r io.Reader, s layer.SceneID) *GeoJSONDecoder {
	return &GeoJSONDecoder{
		reader:    r,
		sceneId:   s,
		groupName: "",
	}
}

func validateFeatures(fc []*geojson.Feature) []*geojson.Feature {
	var res []*geojson.Feature
	for _, f := range fc {
		if f.Geometry == nil {
			continue
		}
		switch g := f.Geometry.(type) {
		case orb.MultiPolygon:
			for _, p := range g {
				nf := geojson.NewFeature(p)
				if nf.Properties == nil {
					nf.Properties = make(map[string]interface{})
				}
				for k, v := range f.Properties {
					nf.Properties[k] = v
				}
				res = append(res, nf)
			}
		default:
			res = append(res, f)
		}
	}

	return res
}

func (d *GeoJSONDecoder) Decode() (Result, error) {
	lg, err := layer.NewGroup().NewID().Scene(d.sceneId).Name("GeoJSON").Build()
	if err != nil {
		return Result{}, err
	}

	con, err := io.ReadAll(d.reader)
	if err != nil {
		return Result{}, errors.New("unable to parse file content")
	}
	fc, err := geojson.UnmarshalFeatureCollection(con)

	if err != nil {
		return Result{}, errors.New("unable to parse file content")
	}
	fl := validateFeatures(fc.Features)
	// if feature collection > append it to features list, else try to decode a single feature (layer)
	if len(fc.Features) > 0 {
		d.features = fl
	} else {
		f, err := geojson.UnmarshalFeature(con)
		if err != nil {
			return Result{}, errors.New("unable to parse file content")
		}
		d.features = append(d.features, f)
	}

	var layers layer.Map
	var properties property.Map
	for range d.features {
		li, p, err := d.decodeLayer()
		if errors.Is(err, io.EOF) {
			return resultFrom(lg, layers, properties)
		}
		if err != nil {
			return Result{}, err
		}

		if li != nil {
			var l layer.Layer = li
			lg.Layers().AddLayer(l.ID(), -1)
			layers = layers.Add(&l)
		}

		if p != nil {
			properties = properties.Add(p)
		}
	}

	return resultFrom(lg, layers, properties)
}

func (d *GeoJSONDecoder) decodeLayer() (*layer.Item, *property.Property, error) {
	var feat *geojson.Feature
	var p *property.Property
	var l *layer.Item
	var ex layer.PluginExtensionID
	var err error
	var stroke, fillColor string
	var strokeWidth float64
	var ok bool
	var layerName string

	if len(d.features) > 0 {
		feat, d.features = d.features[0], d.features[1:]
	} else {
		return nil, nil, io.EOF
	}

	switch g := feat.Geometry.(type) {
	case orb.Point:
		var latlng property.LatLng
		var height float64
		if len(g.Point()) > 2 {
			height = g.Point()[2]
		}
		latlng = property.LatLng{
			Lat: g.Lat(),
			Lng: g.Lon(),
		}

		p, err = createProperty("Point", property.LatLngHeight{
			Lat:    latlng.Lat,
			Lng:    latlng.Lng,
			Height: height,
		}, d.sceneId, feat.Properties["marker-color"], "geojson")
		if err != nil {
			return nil, nil, err
		}
		ex = extensions["Point"]

		layerName = "Point"
	case orb.LineString:
		var coords []property.LatLngHeight
		for _, c := range g {
			var height float64
			if len(c) == 2 {
				height = 0
			} else if len(c) == 3 {
				height = c[2]
			} else {
				return nil, nil, errors.New("unable to parse coordinates")
			}
			coords = append(coords, property.LatLngHeight{Lat: c.Lat(), Lng: c.Lon(), Height: height})
		}

		if feat.Properties["stroke"] != nil {
			stroke, ok = feat.Properties["stroke"].(string)
			if !ok {
				return nil, nil, errors.New("unable to parse")
			}
		}
		if feat.Properties["stroke-width"] != nil {

			strokeWidth, ok = feat.Properties["stroke-width"].(float64)
			if !ok {
				return nil, nil, errors.New("unable to parse")
			}
		}
		ex = extensions["Polyline"]
		p, err = createProperty("Polyline", coords, d.sceneId, GeoStyle{StrokeColor: stroke, StrokeWidth: strokeWidth}, "geojson")
		if err != nil {
			return nil, nil, err
		}

		layerName = "Polyline"
	case orb.Polygon:
		var poly [][]property.LatLngHeight
		for _, r := range g {
			var coords []property.LatLngHeight
			for _, c := range r {
				var height float64
				if len(c) == 2 {
					height = 0
				} else if len(c) == 3 {
					height = c[2]
				} else {
					return nil, nil, errors.New("unable to parse coordinates")
				}
				coords = append(coords, property.LatLngHeight{Lat: c.Lat(), Lng: c.Lon(), Height: height})
			}
			poly = append(poly, coords)
		}

		ex = extensions["Polygon"]
		if feat.Properties["stroke"] != nil {

			stroke, ok = feat.Properties["stroke"].(string)
			if !ok {
				return nil, nil, errors.New("unable to parse")
			}
		}

		if feat.Properties["stroke-width"] != nil {
			strokeWidth, ok = feat.Properties["stroke-width"].(float64)
			if !ok {
				return nil, nil, errors.New("unable to parse")
			}
		}

		if feat.Properties["stroke-width"] != nil {
			fillColor, ok = feat.Properties["fill"].(string)
			if !ok {
				return nil, nil, errors.New("unable to parse")
			}
		}

		p, err = createProperty("Polygon", poly, d.sceneId, GeoStyle{StrokeColor: stroke, StrokeWidth: strokeWidth, FillColor: fillColor}, "geojson")
		if err != nil {
			return nil, nil, err
		}

		layerName = "Polygon"
	default:
		return nil, nil, fmt.Errorf("unsupported type %T", g)
	}

	if feat.Properties["name"] != nil {
		// name is not required, so no need to return error if name is not decoded
		layerName, _ = feat.Properties["name"].(string)
	}

	l, err = layer.
		NewItem().
		NewID().
		Name(layerName).
		Scene(d.sceneId).
		Property(p.IDRef()).
		Extension(&ex).
		Plugin(&layer.OfficialPluginID).
		Build()
	if err != nil {
		return nil, nil, err
	}
	return l, p, nil
}
