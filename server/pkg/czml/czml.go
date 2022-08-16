package czml

type Feature struct {
	Id       string    `json:"id"`
	Name     string    `json:"name"`
	Polygon  *Polygon  `json:"polygon,omitempty"`
	Polyline *Polyline `json:"polyline,omitempty"`
	Position *Position `json:"position,omitempty"`
	Point    *Point    `json:"point,omitempty"`
}
type Polyline struct {
	Positions Position  `json:"positions"`
	Material  *Material `json:"material,omitempty"`
	Width     float64   `json:"width,omitempty"`
}
type Polygon struct {
	Positions   Position  `json:"positions"`
	Fill        bool      `json:"fill,omitempty"`
	Material    *Material `json:"material,omitempty"`
	Stroke      bool      `json:"outline,omitempty"`
	StrokeColor *Color    `json:"outlineColor,omitempty"`
	StrokeWidth float64   `json:"outlineWidth,omitempty"`
}
type Point struct {
	Color     string  `json:"color,omitempty"`
	PixelSize float64 `json:"pixelSize,omitempty"`
}
type Position struct {
	CartographicDegrees []float64 `json:"cartographicDegrees"`
}
type Material struct {
	SolidColor      *SolidColor      `json:"solidColor,omitempty"`
	PolylineOutline *PolylineOutline `json:"polylineOutline,omitempty"`
}
type PolylineOutline struct {
	Color *Color `json:"color"`
}
type SolidColor struct {
	Color *Color `json:"color"`
}
type Color struct {
	RGBA      []int64   `json:"rgba,omitempty"`
	RGBAF     []float64 `json:"rgbaf,omitempty"`
	Reference string    `json:"reference,omitempty"`
}
