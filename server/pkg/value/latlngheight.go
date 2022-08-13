package value

import "github.com/mitchellh/mapstructure"

type LatLngHeight struct {
	Lat    float64 `json:"lat" mapstructure:"lat"`
	Lng    float64 `json:"lng" mapstructure:"lng"`
	Height float64 `json:"height" mapstructure:"height"`
}

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

var TypeLatLngHeight Type = "latlngheight"

type propertyLatLngHeight struct{}

func (p *propertyLatLngHeight) I2V(i interface{}) (interface{}, bool) {
	switch v := i.(type) {
	case LatLngHeight:
		return v, true
	case LatLng:
		return LatLngHeight{Lat: v.Lat, Lng: v.Lng, Height: 0}, true
	case *LatLngHeight:
		if v != nil {
			return p.I2V(*v)
		}
	case *LatLng:
		if v != nil {
			return p.I2V(*v)
		}
	}

	v := LatLngHeight{}
	if err := mapstructure.Decode(i, &v); err == nil {
		return v, true
	}
	return nil, false
}

func (*propertyLatLngHeight) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyLatLngHeight) Validate(i interface{}) bool {
	_, ok := i.(LatLngHeight)
	return ok
}

func (v *Value) ValueLatLngHeight() (vv LatLngHeight, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(LatLngHeight)
	return
}
