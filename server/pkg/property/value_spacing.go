package property

import (
	"github.com/mitchellh/mapstructure"
)

var ValueTypeSpacing = ValueType("spacing")

type Spacing struct {
	Top    float64 `json:"top"    mapstructure:"top"`
	Bottom float64 `json:"bottom" mapstructure:"bottom"`
	Left   float64 `json:"left"   mapstructure:"left"`
	Right  float64 `json:"right"  mapstructure:"right"`
}

func (c *Spacing) Clone() *Spacing {
	if c == nil {
		return nil
	}
	return &Spacing{
		Top:    c.Top,
		Bottom: c.Bottom,
		Left:   c.Left,
		Right:  c.Right,
	}
}

type typePropertySpacing struct{}

func (*typePropertySpacing) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(Spacing); ok {
		return v, true
	}

	if v, ok := i.(*Spacing); ok {
		if v != nil {
			return *v, true
		}
		return nil, false
	}

	v := Spacing{}
	if err := mapstructure.Decode(i, &v); err == nil {
		return v, true
	}
	return nil, false
}

func (*typePropertySpacing) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*typePropertySpacing) Validate(i interface{}) bool {
	_, ok := i.(Spacing)
	return ok
}

func (p *typePropertySpacing) String(i interface{}) string {
	if !p.Validate(i) {
		return ""
	}
	return ""
	// Should be implemented if needed
	// return i.(Spacing).String()
}

func (p *typePropertySpacing) JSONSchema() map[string]any {
	return map[string]any{
		"type":  "object",
		"title": "Spacing",
		"properties": map[string]any{
			"top": map[string]any{
				"type": "number",
			},
			"bottom": map[string]any{
				"type": "number",
			},
			"left": map[string]any{
				"type": "number",
			},
			"right": map[string]any{
				"type": "number",
			},
		},
	}
}

func (v *Value) ValueSpacing() (vv Spacing, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.Value().(Spacing)
	return
}
