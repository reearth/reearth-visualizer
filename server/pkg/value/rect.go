package value

import (
	"fmt"

	"github.com/mitchellh/mapstructure"
)

var TypeRect Type = "rect"

type Rect struct {
	West  float64 `json:"west" mapstructure:"west"`
	South float64 `json:"south" mapstructure:"south"`
	East  float64 `json:"east" mapstructure:"east"`
	North float64 `json:"north" mapstructure:"north"`
}

func (r Rect) String() string {
	return fmt.Sprintf("%f, %f, %f, %f", r.West, r.South, r.East, r.North)
}

type propertyRect struct{}

func (p *propertyRect) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(Rect); ok {
		return v, true
	} else if v, ok := i.(*Rect); ok {
		if v != nil {
			return p.I2V(*v)
		}
		return nil, false
	}

	v := Rect{}
	if err := mapstructure.Decode(i, &v); err == nil {
		return v, false
	}

	return nil, false
}

func (*propertyRect) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyRect) Validate(i interface{}) bool {
	_, ok := i.(Rect)
	return ok
}

func (p *propertyRect) String(i any) string {
	if !p.Validate(i) {
		return ""
	}
	return i.(Rect).String()
}

func (v *propertyRect) JSONSchema() map[string]any {
	return map[string]any{
		"type":  "object",
		"title": "Rect",
		"properties": map[string]any{
			"west":  map[string]any{"type": "number"},
			"south": map[string]any{"type": "number"},
			"east":  map[string]any{"type": "number"},
			"north": map[string]any{"type": "number"},
		},
	}
}

func (v *Value) ValueRect() (vv Rect, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Rect)
	return
}
