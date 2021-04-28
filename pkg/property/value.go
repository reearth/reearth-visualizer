package property

type ValueInner interface {
	Value() *Value
}

// LatLng _
type LatLng struct {
	Lat float64 `json:"lat" mapstructure:"lat"`
	Lng float64 `json:"lng" mapstructure:"lng"`
}

// Clone _
func (l *LatLng) Clone() *LatLng {
	if l == nil {
		return nil
	}
	return &LatLng{
		Lat: l.Lat,
		Lng: l.Lng,
	}
}

// LatLngHeight _
type LatLngHeight struct {
	Lat    float64 `json:"lat" mapstructure:"lat"`
	Lng    float64 `json:"lng" mapstructure:"lng"`
	Height float64 `json:"height" mapstructure:"height"`
}

// Clone _
func (l *LatLngHeight) Clone() *LatLngHeight {
	if l == nil {
		return nil
	}
	return &LatLngHeight{
		Lat:    l.Lat,
		Lng:    l.Lng,
		Height: l.Height,
	}
}

// Camera _
type Camera struct {
	Lat      float64 `json:"lat" mapstructure:"lat"`
	Lng      float64 `json:"lng" mapstructure:"lng"`
	Altitude float64 `json:"altitude" mapstructure:"altitude"`
	Heading  float64 `json:"heading" mapstructure:"heading"`
	Pitch    float64 `json:"pitch" mapstructure:"pitch"`
	Roll     float64 `json:"roll" mapstructure:"roll"`
	FOV      float64 `json:"fov" mapstructure:"fov"`
}

// Clone _
func (c *Camera) Clone() *Camera {
	if c == nil {
		return nil
	}
	return &Camera{
		Lat:      c.Lat,
		Lng:      c.Lng,
		Altitude: c.Altitude,
		Heading:  c.Heading,
		Pitch:    c.Pitch,
		Roll:     c.Roll,
		FOV:      c.FOV,
	}
}

// Typography _
type Typography struct {
	FontFamily *string    `json:"fontFamily" mapstructure:"fontFamily"`
	FontWeight *string    `json:"fontWeight" mapstructure:"fontWeight"`
	FontSize   *int       `json:"fontSize" mapstructure:"fontSize"`
	Color      *string    `json:"color" mapstructure:"color"`
	TextAlign  *TextAlign `json:"textAlign" mapstructure:"textAlign"`
	Bold       *bool      `json:"bold" mapstructure:"bold"`
	Italic     *bool      `json:"italic" mapstructure:"italic"`
	Underline  *bool      `json:"underline" mapstructure:"underline"`
}

// Clone _
func (t *Typography) Clone() *Typography {
	if t == nil {
		return nil
	}
	return &Typography{
		FontFamily: t.FontFamily,
		FontWeight: t.FontWeight,
		FontSize:   t.FontSize,
		Color:      t.Color,
		TextAlign:  t.TextAlign,
		Bold:       t.Bold,
		Italic:     t.Italic,
		Underline:  t.Underline,
	}
}

// TextAlign _
type TextAlign string

const (
	// TextAlignLeft _
	TextAlignLeft TextAlign = "left"
	// TextAlignCenter _
	TextAlignCenter TextAlign = "center"
	// TextAlignRight _
	TextAlignRight TextAlign = "right"
	// TextAlignJustify _
	TextAlignJustify TextAlign = "justify"
	// TextAlignJustifyAll _
	TextAlignJustifyAll TextAlign = "justify_all"
)

// TextAlignFrom _
func TextAlignFrom(t string) (TextAlign, bool) {
	switch TextAlign(t) {
	case TextAlignLeft:
		return TextAlignLeft, true
	case TextAlignCenter:
		return TextAlignCenter, true
	case TextAlignRight:
		return TextAlignRight, true
	case TextAlignJustify:
		return TextAlignJustify, true
	case TextAlignJustifyAll:
		return TextAlignJustifyAll, true
	}
	return TextAlign(""), false
}

// TextAlignFromRef _
func TextAlignFromRef(t *string) *TextAlign {
	if t == nil {
		return nil
	}
	var t2 TextAlign
	switch TextAlign(*t) {
	case TextAlignLeft:
		t2 = TextAlignLeft
	case TextAlignCenter:
		t2 = TextAlignCenter
	case TextAlignRight:
		t2 = TextAlignRight
	case TextAlignJustify:
		t2 = TextAlignJustify
	case TextAlignJustifyAll:
		t2 = TextAlignJustifyAll
	default:
		return nil
	}
	return &t2
}

// String _
func (t TextAlign) String() string {
	return string(t)
}

// StringRef _
func (t *TextAlign) StringRef() *string {
	if t == nil {
		return nil
	}
	t2 := string(*t)
	return &t2
}

// Coordinates _
type Coordinates []LatLngHeight

// CoordinatesFrom generates a new Coordinates from slice such as [lon, lat, alt, lon, lat, alt, ...]
func CoordinatesFrom(coords []float64) Coordinates {
	if len(coords) == 0 {
		return nil
	}

	r := make([]LatLngHeight, 0, len(coords)/3)
	l := LatLngHeight{}
	for i, c := range coords {
		switch i % 3 {
		case 0:
			l = LatLngHeight{}
			l.Lng = c
		case 1:
			l.Lat = c
		case 2:
			l.Height = c
			r = append(r, l)
		}
	}

	return r
}

// Polygon _
type Polygon []Coordinates

// Rect _
type Rect struct {
	West  float64 `json:"west" mapstructure:"west"`
	South float64 `json:"south" mapstructure:"south"`
	East  float64 `json:"east" mapstructure:"east"`
	North float64 `json:"north" mapstructure:"north"`
}

// Value _
func (l LatLng) Value() *Value {
	return ValueTypeLatLng.ValueFromUnsafe(l)
}

// Value _
func (l LatLngHeight) Value() *Value {
	return ValueTypeLatLngHeight.ValueFromUnsafe(l)
}

// Value _
func (c Camera) Value() *Value {
	return ValueTypeCamera.ValueFromUnsafe(c)
}

// Value _
func (t Typography) Value() *Value {
	return ValueTypeTypography.ValueFromUnsafe(t)
}

// Value _
func (t Coordinates) Value() *Value {
	return ValueTypeCoordinates.ValueFromUnsafe(t)
}

// Value _
func (t Polygon) Value() *Value {
	return ValueTypePolygon.ValueFromUnsafe(t)
}

// Value _
func (t Rect) Value() *Value {
	return ValueTypeRect.ValueFromUnsafe(t)
}
