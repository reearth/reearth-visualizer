package value

import (
	"fmt"

	"github.com/mitchellh/mapstructure"
)

type LatLng struct {
	Lat float64 `json:"lat" mapstructure:"lat"`
	Lng float64 `json:"lng" mapstructure:"lng"`
}

func (l *LatLng) Clone() *LatLng {
	if l == nil {
		return nil
	}
	return &LatLng{
		Lat: l.Lat,
		Lng: l.Lng,
	}
}

func (l LatLng) String() string {
	return fmt.Sprintf("%f, %f", l.Lng, l.Lat)
}

var TypeLatLng Type = "latlng"

type propertyLatLng struct{}

func (p *propertyLatLng) I2V(i interface{}) (interface{}, bool) {
	switch v := i.(type) {
	case LatLng:
		return v, true
	case LatLngHeight:
		return LatLng{Lat: v.Lat, Lng: v.Lng}, true
	case *LatLng:
		if v != nil {
			return p.I2V(*v)
		}
	case *LatLngHeight:
		if v != nil {
			return p.I2V(*v)
		}
	}

	v := LatLng{}
	if err := mapstructure.Decode(i, &v); err != nil {
		return nil, false
	}
	return v, true
}

func (*propertyLatLng) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyLatLng) Validate(i interface{}) bool {
	_, ok := i.(LatLng)
	return ok
}

func (p *propertyLatLng) String(i any) string {
	if !p.Validate(i) {
		return ""
	}
	return i.(LatLng).String()
}

func (v *propertyLatLng) JSONSchema() map[string]any {
	return map[string]any{
		"type":  "object",
		"title": "LatLng",
		"required": []string{
			"lat",
			"lng",
		},
		"properties": map[string]any{
			"lat": map[string]any{
				"type": "number",
			},
			"lng": map[string]any{
				"type": "number",
			},
		},
	}
}

func (v *Value) ValueLatLng() (vv LatLng, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(LatLng)
	return
}
