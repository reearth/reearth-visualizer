package decoding

import (
	"encoding/xml"
	"errors"
	"io"
	"regexp"
	"strconv"
	"strings"

	"github.com/reearth/reearth/server/pkg/kml"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
)

type KMLDecoder struct {
	decoder *xml.Decoder
	sceneId layer.SceneID
	styles  map[string]kml.Style
}

func NewKMLDecoder(d *xml.Decoder, s layer.SceneID) *KMLDecoder {
	return &KMLDecoder{
		decoder: d,
		sceneId: s,
		styles:  make(map[string]kml.Style),
	}
}

func coordinatesToLatLngHeight(c string) (*property.LatLng, float64, error) {
	parts := strings.Split(strings.TrimSpace(c), ",")
	lng, err := strconv.ParseFloat(parts[0], 64)
	if err != nil {
		return nil, 0, err
	}
	lat, err := strconv.ParseFloat(parts[1], 64)
	if err != nil {
		return nil, 0, err
	}
	LatLng := property.LatLng{Lat: lat, Lng: lng}
	var height float64
	if len(parts) > 2 {
		height, err = strconv.ParseFloat(parts[2], 64)
		if err != nil {
			return nil, 0, err
		}
	}
	return &LatLng, height, nil
}

func coordinatesToLatLngHeightList(c string) ([]property.LatLngHeight, error) {
	var LatLngHeighList []property.LatLngHeight
	coords := strings.Fields(c)
	for _, llh := range coords {
		reg, err := regexp.Compile(`\s+`)
		if err != nil {
			return nil, err
		}
		processed := reg.ReplaceAllString(llh, "")
		parts := strings.Split(processed, ",")
		lng, err := strconv.ParseFloat(parts[0], 64)
		if err != nil {
			return nil, err
		}
		lat, err := strconv.ParseFloat(parts[1], 64)
		if err != nil {
			return nil, err
		}
		heigh, err := strconv.ParseFloat(parts[2], 64)
		if err != nil {
			return nil, err
		}
		LatLngHeigh := property.LatLngHeight{Lat: lat, Lng: lng, Height: heigh}
		LatLngHeighList = append(LatLngHeighList, LatLngHeigh)
	}

	return LatLngHeighList, nil
}

func getPolygon(p *kml.Polygon) ([][]property.LatLngHeight, error) {
	var pol [][]property.LatLngHeight
	outer, err := coordinatesToLatLngHeightList(p.OuterBoundaryIs.LinearRing.Coordinates)
	if err != nil {
		return nil, err
	}
	pol = append(pol, outer)
	if len(p.InnerBoundaryIs) > 0 {
		for _, ib := range p.InnerBoundaryIs {
			coords, err := coordinatesToLatLngHeightList(ib.LinearRing.Coordinates)
			if err != nil {
				return nil, err
			}
			pol = append(pol, coords)
		}
	}
	return pol, nil
}

func (d *KMLDecoder) parseKML() (interface{}, error) {
	for {
		token, err := d.decoder.Token()
		if errors.Is(err, io.EOF) || token == nil {
			return nil, io.EOF
		}
		if err != nil {
			return nil, err
		}
		switch startElement := token.(type) {
		case xml.StartElement:
			st := startElement.Name.Local
			switch st {
			case "Document", "Folder":
				var c kml.Collection
				err := d.decoder.DecodeElement(&c, &startElement)
				if err != nil {
					return nil, err
				}
				return c, nil
			case "Placemark":
				var p kml.Placemark
				err := d.decoder.DecodeElement(&p, &startElement)
				if err != nil {
					return nil, err
				}
				return p, nil
			}
		}
	}
}

func (d *KMLDecoder) decodeCollection(c kml.Collection, depth int) (*layer.Group, layer.Map, property.Map, error) {
	var ll layer.Map
	var pl property.Map
	lg, err := layer.NewGroup().NewID().Name(c.Name).Scene(d.sceneId).Build()
	if err != nil {
		return nil, nil, nil, err
	}

	if len(c.Styles) > 0 {
		for _, s := range c.Styles {
			d.styles[s.Id] = s
		}
	}

	for _, f := range c.Folders {
		flg, flil, fpl, err := d.decodeCollection(f, depth+1)
		if err != nil {
			return nil, nil, nil, err
		}

		if depth >= 4 {
			lg.Layers().AppendLayers(flg.Layers().Layers()...)
		} else {
			lg.Layers().AppendLayers(flg.ID())
			ll = ll.Add(flg.LayerRef())
		}

		ll = ll.Merge(flil)
		pl = pl.Merge(fpl)
	}

	for _, p := range c.Placemarks {
		pli, pp, err := d.decodePlacemark(p)
		if err != nil {
			return nil, nil, nil, err
		}
		lg.Layers().AppendLayers(pli.ID())
		var l layer.Layer = pli
		ll = ll.Add(&l)
		pl = pl.Add(pp)
	}

	return lg, ll, pl, nil
}

func (d *KMLDecoder) decodePlacemark(p kml.Placemark) (*layer.Item, *property.Property, error) {
	var layerItem *layer.Item
	var prop *property.Property
	var ex layer.PluginExtensionID
	var styleId string
	var layerName string

	if len(p.StyleUrl) > 0 {
		styleId = p.StyleUrl[1:]
	}

	if len(p.Point.Coordinates) > 0 {
		latlng, height, err := coordinatesToLatLngHeight(p.Point.Coordinates)
		if err != nil {
			return nil, nil, err
		}
		prop, err = createProperty("Point", property.LatLngHeight{
			Lat:    latlng.Lat,
			Lng:    latlng.Lng,
			Height: height,
		}, d.sceneId, d.styles[styleId], "kml")
		if err != nil {
			return nil, nil, err
		}
		ex = extensions["Point"]
		layerName = "Point"
	} else if len(p.Polygon.OuterBoundaryIs.LinearRing.Coordinates) > 0 {
		coordslist, err := getPolygon(&p.Polygon)
		if err != nil {
			return nil, nil, err
		}
		ex = extensions["Polygon"]
		layerName = "Polygon"
		prop, err = createProperty("Polygon", coordslist, d.sceneId, d.styles[styleId], "kml")
		if err != nil {
			return nil, nil, err
		}
	} else if len(p.Polyline.Coordinates) > 0 {
		coords, err := coordinatesToLatLngHeightList(p.Polyline.Coordinates)
		if err != nil {
			return nil, nil, err
		}
		ex = extensions["Polyline"]
		layerName = "Polyline"
		prop, err = createProperty("Polyline", coords, d.sceneId, d.styles[styleId], "kml")
		if err != nil {
			return nil, nil, err
		}
	} else {
		var err error
		prop, err = createProperty("Point", nil, d.sceneId, d.styles[styleId], "kml")
		if err != nil {
			return nil, nil, err
		}
		ex = extensions["Point"]
		layerName = "Point"
	}

	if len(p.Name) > 0 {
		layerName = p.Name
	}

	layerItem, err := layer.
		NewItem().
		NewID().
		Name(layerName).
		Scene(d.sceneId).
		Property(prop.IDRef()).
		Extension(&ex).
		Plugin(&layer.OfficialPluginID).
		Build()
	if err != nil {
		return nil, nil, err
	}

	return layerItem, prop, nil
}

func (d *KMLDecoder) Decode() (Result, error) {
	var ll layer.Map
	var lg *layer.Group
	var pl property.Map

	for {
		parsed, err := d.parseKML()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return Result{}, err
		}

		switch p := parsed.(type) {
		case kml.Collection:
			lg, ll, pl, err = d.decodeCollection(p, 0)
			if err != nil {
				return Result{}, err
			}
		case kml.Placemark:
			if lg == nil {
				lg, err = layer.NewGroup().NewID().Scene(d.sceneId).Name("KML").Build()
				if err != nil {
					return Result{}, err
				}
			}

			li, pp, err := d.decodePlacemark(p)
			if err != nil {
				return Result{}, err
			}

			if li != nil {
				lg.Layers().AddLayer(li.ID(), -1)
				ll = ll.Add(li.LayerRef())
			}

			if pp != nil {
				pl = pl.Add(pp)
			}
		}
	}

	return resultFrom(lg, ll, pl)
}
