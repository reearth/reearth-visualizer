package property

import (
	"github.com/mitchellh/mapstructure"
)

var ValueTypePhotoOverlay = ValueType("photooverlay")

type PhotoOverlay struct {
	Enabled        *bool `json:"enabled"        mapstructure:"enabled"`
	CameraDuration *int  `json:"cameraDuration" mapstructure:"cameraDuration"`
}

func (c *PhotoOverlay) Clone() *PhotoOverlay {
	if c == nil {
		return nil
	}
	return &PhotoOverlay{
		Enabled:        c.Enabled,
		CameraDuration: c.CameraDuration,
	}
}

type typePropertyPhotoOverlay struct{}

func (*typePropertyPhotoOverlay) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(PhotoOverlay); ok {
		return v, true
	}

	if v, ok := i.(*PhotoOverlay); ok {
		if v != nil {
			return *v, true
		}
		return nil, false
	}

	v := PhotoOverlay{}
	if err := mapstructure.Decode(i, &v); err == nil {
		return v, true
	}
	return nil, false
}

func (*typePropertyPhotoOverlay) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*typePropertyPhotoOverlay) Validate(i interface{}) bool {
	_, ok := i.(PhotoOverlay)
	return ok
}

func (p *typePropertyPhotoOverlay) String(i interface{}) string {
	if !p.Validate(i) {
		return ""
	}
	return ""
}

func (p *typePropertyPhotoOverlay) JSONSchema() map[string]any {
	return map[string]any{
		"type":  "object",
		"title": "PhotoOverlay",
		"properties": map[string]any{
			"enabled": map[string]any{
				"type": "bool",
			},
			"cameraDuration": map[string]any{
				"type": "number",
			},
		},
	}
}

func (v *Value) ValuePhotoOverlay() (vv PhotoOverlay, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.Value().(PhotoOverlay)
	return
}
