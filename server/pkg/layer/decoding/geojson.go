package decoding

import (
	"errors"
	"fmt"
	"io"

	geojson "github.com/paulmach/go.geojson"
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
		if f.Geometry.Type == geojson.GeometryMultiPolygon {
			for _, p := range f.Geometry.MultiPolygon {
				nf := geojson.NewPolygonFeature(p)
				for k, v := range f.Properties {
					nf.SetProperty(k, v)
				}
				res = append(res, nf)
			}
		} else {
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

	switch feat.Geometry.Type {
	case "Point":
		var latlng property.LatLng
		var height float64
		if len(feat.Geometry.Point) > 2 {
			height = feat.Geometry.Point[2]
		}
		latlng = property.LatLng{
			Lat: feat.Geometry.Point[1],
			Lng: feat.Geometry.Point[0],
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
	case "LineString":
		var coords []property.LatLngHeight
		for _, c := range feat.Geometry.LineString {
			var height float64
			if len(c) == 2 {
				height = 0
			} else if len(c) == 3 {
				height = c[3]
			} else {
				return nil, nil, errors.New("unable to parse coordinates")
			}
			coords = append(coords, property.LatLngHeight{Lat: c[1], Lng: c[0], Height: height})
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
	case "Polygon":
		var poly [][]property.LatLngHeight
		for _, r := range feat.Geometry.Polygon {
			var coords []property.LatLngHeight
			for _, c := range r {
				var height float64
				if len(c) == 2 {
					height = 0
				} else if len(c) == 3 {
					height = c[3]
				} else {
					return nil, nil, errors.New("unable to parse coordinates")
				}
				coords = append(coords, property.LatLngHeight{Lat: c[1], Lng: c[0], Height: height})
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
		return nil, nil, fmt.Errorf("unsupported type %s", feat.Geometry.Type)
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

func ValidateGeoJSONFeatureCollection(data []byte) error {

	var validationErrors []error

	f, err := geojson.UnmarshalFeature(data)
	if err != nil {
		return err
	}
	if f.Type == "Feature" {

		if f.BoundingBox != nil {
			if err := validateBBox(f.BoundingBox); err != nil {
				validationErrors = append(validationErrors, fmt.Errorf("Invalid BBox: %w", err))
			}
		}

		if errs := validateGeoJSONFeature(f); len(errs) > 0 {
			validationErrors = append(validationErrors, errs...)
		}

	} else if f.Type == "FeatureCollection" {

		fc, err := geojson.UnmarshalFeatureCollection(data)
		if err != nil {
			return err
		}

		if fc.BoundingBox != nil {
			if err := validateBBox(fc.BoundingBox); err != nil {
				validationErrors = append(validationErrors, fmt.Errorf("Invalid BBox: %w", err))
			}
		}

		for _, feature := range fc.Features {
			if errs := validateGeoJSONFeature(feature); len(errs) > 0 {
				validationErrors = append(validationErrors, errs...)
			}
		}

	} else {
		return errors.New("Invalid Geojson")
	}

	if len(validationErrors) > 0 {
		return fmt.Errorf("Validation failed: %v", validationErrors)
	}

	return nil
}

func validateGeoJSONFeature(feature *geojson.Feature) []error {
	var validationErrors []error

	if feature.Geometry == nil {
		validationErrors = append(validationErrors, errors.New("Geometry is missing"))
		return validationErrors
	}

	if feature.BoundingBox != nil {
		if err := validateBBox(feature.BoundingBox); err != nil {
			validationErrors = append(validationErrors, fmt.Errorf("Invalid BBox: %w", err))
		}
	}
	switch feature.Geometry.Type {
	case "Point":
		if !isValidLatLon(feature.Geometry.Point) {
			validationErrors = append(validationErrors, errors.New("Point latitude or longitude is invalid"))
		}
	case "MultiPoint":
		if len(feature.Geometry.MultiPoint) == 0 {
			validationErrors = append(validationErrors, errors.New("MultiPoint must contain at least one coordinate"))
		}
		for _, point := range feature.Geometry.MultiPoint {
			if !isValidLatLon(point) {
				validationErrors = append(validationErrors, errors.New("MultiPoint contains invalid latitude or longitude"))
			}
		}
	case "LineString":
		if len(feature.Geometry.LineString) < 2 {
			validationErrors = append(validationErrors, errors.New("LineString must contain at least two coordinates"))
		}
		for _, coords := range feature.Geometry.LineString {
			if !isValidLatLon(coords) {
				validationErrors = append(validationErrors, errors.New("LineString contains invalid latitude or longitude"))
			}
		}
	case "MultiLineString":
		if len(feature.Geometry.MultiLineString) == 0 {
			validationErrors = append(validationErrors, errors.New("MultiLineString must contain at least one line"))
		}
		for _, line := range feature.Geometry.MultiLineString {
			if len(line) < 2 {
				validationErrors = append(validationErrors, errors.New("Each line in MultiLineString must contain at least two coordinates"))
			}
			for _, coords := range line {
				if !isValidLatLon(coords) {
					validationErrors = append(validationErrors, errors.New("MultiLineString contains invalid latitude or longitude"))
				}
			}
		}
	case "Polygon":
		if len(feature.Geometry.Polygon) == 0 {
			validationErrors = append(validationErrors, errors.New("Polygon must contain coordinates"))
		}
		for _, ring := range feature.Geometry.Polygon {
			if len(ring) < 4 || !pointsEqual(ring[0], ring[len(ring)-1]) {
				validationErrors = append(validationErrors, errors.New("Polygon ring is not closed"))
			}
			for _, coords := range ring {
				if !isValidLatLon(coords) {
					validationErrors = append(validationErrors, errors.New("Polygon contains invalid latitude or longitude"))
				}
			}
		}
	case "MultiPolygon":
		if len(feature.Geometry.MultiPolygon) == 0 {
			validationErrors = append(validationErrors, errors.New("MultiPolygon must contain at least one Polygon"))
		}
		for _, polygon := range feature.Geometry.MultiPolygon {
			for _, ring := range polygon {
				if len(ring) < 4 || !pointsEqual(ring[0], ring[len(ring)-1]) {
					validationErrors = append(validationErrors, errors.New("MultiPolygon ring is not closed"))
				}
				for _, coords := range ring {
					if !isValidLatLon(coords) {
						validationErrors = append(validationErrors, errors.New("MultiPolygon contains invalid latitude or longitude"))
					}
				}
			}
		}
	case "GeometryCollection":
		if len(feature.Geometry.Geometries) == 0 {
			validationErrors = append(validationErrors, errors.New("GeometryCollection must contain at least one Geometry"))
		}
		for _, geometry := range feature.Geometry.Geometries {
			if errs := validateGeoJSONFeature(&geojson.Feature{Geometry: geometry}); len(errs) > 0 {
				validationErrors = append(validationErrors, errs...)
			}
		}
	default:
		validationErrors = append(validationErrors, fmt.Errorf("Unsupported Geometry type: %s", feature.Geometry.Type))
	}

	return validationErrors
}

func pointsEqual(a, b []float64) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func isValidLatLon(coords []float64) bool {
	if len(coords) != 2 && len(coords) != 3 {
		return false
	}
	lat, lon := coords[1], coords[0]
	return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

func validateBBox(bbox []float64) error {
	if len(bbox) != 4 && len(bbox) != 6 {
		return errors.New("bbox must have 4 or 6 elements")
	}
	minLon, minLat := bbox[0], bbox[1]
	maxLon, maxLat := bbox[2], bbox[3]

	if !isValidLatLon([]float64{minLon, minLat}) || !isValidLatLon([]float64{maxLon, maxLat}) {
		return errors.New("bbox values are out of range")
	}
	if minLon > maxLon || minLat > maxLat {
		return errors.New("bbox values are not in the correct order")
	}
	return nil
}
