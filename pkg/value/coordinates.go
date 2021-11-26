package value

import "github.com/mitchellh/mapstructure"

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

var TypeCoordinates Type = "coordinates"

type propertyCoordinates struct{}

func (*propertyCoordinates) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(Coordinates); ok {
		return v, true
	} else if v, ok := i.(*Coordinates); ok {
		if v != nil {
			return *v, true
		}
		return nil, false
	} else if v2, ok := i.([]float64); ok {
		if v2 == nil {
			return nil, false
		}
		return CoordinatesFrom(v2), true
	}

	v2 := Coordinates{}
	if err := mapstructure.Decode(i, &v2); err == nil {
		return v2, true
	}

	v1 := []float64{}
	if err := mapstructure.Decode(i, &v1); err == nil {
		return CoordinatesFrom(v1), true
	}

	return nil, false
}

func (*propertyCoordinates) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyCoordinates) Validate(i interface{}) bool {
	_, ok := i.(bool)
	return ok
}

func (v *Value) ValueCoordinates() (vv Coordinates, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Coordinates)
	return
}
