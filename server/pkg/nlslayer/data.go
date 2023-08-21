package nlslayer

import (
	"net/url"
)

type Data struct {
	DataType       string 
	URL            *url.URL
	Value          interface{}
	Layers         interface{}
	JSONProperties []*string
	UpdateInterval *int
	Parameters     interface{}
	Time           *Time
	CSV            *CSV
}

const (
	GeoJSON              = "geojson"
	ThreeDTiles          = "3dtiles"
	OSMBuildings         = "osm_buildings"
	GooglePhotorealistic = "google_photorealistic"
	CZML                 = "czml"
	CSVType              = "csv"
	WMS                  = "wms"
	MVT                  = "mvt"
	KML                  = "kml"
	GPX                  = "gpx"
	Shapefile            = "shapefile"
	GTFS                 = "gtfs"
	GML                  = "gml"
	GeoRSS               = "georss"
	GLTF                 = "gltf"
	Tiles                = "tiles"
	TMS                  = "tms"
)

func (d *Data) SetDataType(dataType string) {
	d.DataType = dataType
}

func (d *Data) SetURL(url *url.URL) {
	d.URL = url
	if url == nil {
		d.URL = nil
	} else {
		dataURL := *url
		d.URL = &dataURL
	}
}

func (d *Data) SetValue(value interface{}) {
	d.Value = value
}

func (d *Data) SetLayers(layers interface{}) {
	d.Layers = layers
}

func (d *Data) SetJSONProperties(jsonProperties []*string) {
	d.JSONProperties = jsonProperties
}

func (d *Data) SetUpdateInterval(updateInterval *int) {
	d.UpdateInterval = updateInterval
}

func (d *Data) SetParameters(parameters interface{}) {
	d.Parameters = parameters
}

func (d *Data) SetTime(time *Time) {
	d.Time = time
}

func (d *Data) SetCSV(csv *CSV) {
	d.CSV = csv
}

func (d *Data) IsValidType() bool {
	switch d.DataType {
	case GeoJSON, ThreeDTiles, OSMBuildings, GooglePhotorealistic, CZML, CSVType, WMS, MVT, KML, GPX, Shapefile, GTFS, GML, GeoRSS, GLTF, Tiles, TMS:
		return true
	default:
		return false
	}
}

func (d *Data) UpdateCSVIDColumn(idColumn *string) {
	if d.CSV != nil {
		d.CSV.UpdateIDColumn(idColumn)
	}
}

func (d *Data) UpdateDataType(dataType string) {
	d.DataType = dataType
}

func (d *Data) UpdateURL(url *url.URL) {
	d.URL = url
}

func (d *Data) UpdateValue(value interface{}) {
	d.Value = value
}

func (d *Data) UpdateLayers(layers interface{}) {
	d.Layers = layers
}

func (d *Data) UpdateJSONProperties(jsonProperties []*string) {
	d.JSONProperties = jsonProperties
}

func (d *Data) UpdateUpdateInterval(updateInterval *int) {
	d.UpdateInterval = updateInterval
}

func (d *Data) UpdateParameters(parameters interface{}) {
	d.Parameters = parameters
}

func (d *Data) UpdateTime(time *Time) {
	d.Time = time
}

func (d *Data) UpdateCSV(csv *CSV) {
	d.CSV = csv
}
