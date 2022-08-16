package decoding

import (
	"encoding/json"
	"errors"

	"github.com/reearth/reearth/server/pkg/czml"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
)

type CZMLDecoder struct {
	decoder   *json.Decoder
	sceneId   layer.SceneID
	groupName string
}

func NewCZMLDecoder(d *json.Decoder, s layer.SceneID) *CZMLDecoder {
	return &CZMLDecoder{
		decoder:   d,
		sceneId:   s,
		groupName: "",
	}
}

func (d *CZMLDecoder) Decode() (Result, error) {
	var features []czml.Feature
	var layers layer.Map
	lg, err := layer.NewGroup().NewID().Scene(d.sceneId).Build()
	if err != nil {
		return Result{}, err
	}
	var properties property.Map
	err = d.decoder.Decode(&features)
	if err != nil {
		return Result{}, errors.New("unable to parse file content")
	}

	for _, v := range features {
		var li *layer.Item
		var p *property.Property
		if v.Id == "document" {
			d.groupName = v.Name
		}
		// case Polygon
		//ff,_:=v.Polygon.StrokeColor.(map[string][]int64)
		if v.Polygon != nil {
			li, p, err = d.decodeLayer("Polygon", v.Polygon.Positions.CartographicDegrees, v.Polygon, v.Name)
		}
		// case Polyline
		if v.Polyline != nil {
			li, p, err = d.decodeLayer("Polyline", v.Polyline.Positions.CartographicDegrees, v.Polyline, v.Name)
		}
		// case Point
		if v.Point != nil {
			li, p, err = d.decodeLayer("Point", v.Position.CartographicDegrees, v.Point, v.Name)
		}
		if err != nil {
			return Result{}, err
		}
		if li != nil {
			var l layer.Layer = li
			lg.Layers().AddLayer(l.ID(), -1)
			lg.Rename(d.groupName)
			layers = layers.Add(&l)
		}
		if p != nil {
			properties = properties.Add(p)
		}
	}

	return resultFrom(lg, layers, properties)
}

func (d *CZMLDecoder) decodeLayer(t string, coords []float64, style interface{}, layerName string) (*layer.Item, *property.Property, error) {
	var p *property.Property
	var l *layer.Item
	var ex layer.PluginExtensionID
	var err error
	switch t {
	case "Point":
		var latlng property.LatLng
		var height float64
		latlng = property.LatLng{
			Lng: coords[0],
			Lat: coords[1],
		}

		if len(coords) > 2 {
			height = coords[2]
		}

		p, err = createProperty("Point", property.LatLngHeight{
			Lat:    latlng.Lat,
			Lng:    latlng.Lng,
			Height: height,
		}, d.sceneId, style, "czml")

		if err != nil {
			return nil, nil, err
		}

		ex = extensions["Point"]
		if layerName == "" {
			layerName = "Point"
		}
	case "Polyline":
		var crds []property.LatLngHeight
		if len(coords)%3 != 0 {
			return nil, nil, errors.New("unable to parse coordinates")
		}

		for {
			crds = append(crds, property.LatLngHeight{Lng: coords[0], Lat: coords[1], Height: coords[2]})
			if len(coords) == 3 {
				break
			} else {
				coords = coords[3:]
			}
		}

		ex = extensions["Polyline"]
		p, err = createProperty("Polyline", crds, d.sceneId, style, "czml")
		if err != nil {
			return nil, nil, err
		}

		if layerName == "" {
			layerName = "Polyline"
		}
	case "Polygon":
		var poly [][]property.LatLngHeight
		if len(coords)%3 != 0 {
			return nil, nil, errors.New("unable to parse coordinates")
		}

		for {
			var crds []property.LatLngHeight
			crds = append(crds, property.LatLngHeight{Lng: coords[0], Lat: coords[1], Height: coords[2]})
			poly = append(poly, crds)
			if len(coords) == 3 {
				break
			} else {
				coords = coords[3:]
			}
		}

		ex = extensions["Polygon"]
		p, err = createProperty("Polygon", poly, d.sceneId, style, "czml")
		if err != nil {
			return nil, nil, err
		}

		if layerName == "" {
			layerName = "Polygon"
		}
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
