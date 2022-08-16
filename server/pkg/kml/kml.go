package kml

import (
	"github.com/reearth/reearth/server/pkg/property"
)

type Collection struct {
	Folders    []Collection `xml:"Folder"`
	Placemarks []Placemark  `xml:"Placemark"`
	Styles     []Style      `xml:"Style"`
	Name       string       `xml:"name"`
}
type Placemark struct {
	Point    Point      `xml:"Point"`
	Polygon  Polygon    `xml:"Polygon"`
	Polyline LineString `xml:"LineString"`
	Name     string     `xml:"name"`
	StyleUrl string     `xml:"styleUrl"`
}
type BoundaryIs struct {
	LinearRing LinearRing `xml:"LinearRing"`
}
type LinearRing struct {
	Coordinates string `xml:"coordinates"`
}
type Point struct {
	Coordinates string `xml:"coordinates"`
}

type Polygon struct {
	OuterBoundaryIs BoundaryIs   `xml:"outerBoundaryIs"`
	InnerBoundaryIs []BoundaryIs `xml:"innerBoundaryIs"`
}
type LineString struct {
	Coordinates string `xml:"coordinates"`
}
type PointFields struct {
	Latlng *property.LatLng
	Height *float64
}

type IconStyle struct {
	Icon  *Icon   `xml:"Icon"`
	Color string  `xml:"color"`
	Scale float64 `xml:"scale"`
}
type Icon struct {
	Href string `xml:"href"`
}

// Marker Styling
type Style struct {
	Id        string    `xml:"id,attr"`
	IconStyle IconStyle `xml:"IconStyle"`
	LineStyle LineStyle `xml:"LineStyle"`
	PolyStyle PolyStyle `xml:"PolyStyle"`
}

// Polyline Styling
type LineStyle struct {
	Color string  `xml:"color"`
	Width float64 `xml:"width"`
}
type PolyStyle struct {
	Color  string `xml:"color"`
	Fill   bool   `xml:"fill"`
	Stroke bool   `xml:"outline"`
}
