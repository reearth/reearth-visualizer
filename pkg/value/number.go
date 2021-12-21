package value

import (
	"encoding/json"
	"strconv"
)

var TypeNumber Type = "number"

type propertyNumber struct{}

func (*propertyNumber) I2V(i interface{}) (interface{}, bool) {
	switch v := i.(type) {
	case float64:
		return v, true
	case float32:
		return float64(v), true
	case int:
		return float64(v), true
	case int8:
		return float64(v), true
	case int16:
		return float64(v), true
	case int32:
		return float64(v), true
	case int64:
		return float64(v), true
	case uint:
		return float64(v), true
	case uint8:
		return float64(v), true
	case uint16:
		return float64(v), true
	case uint32:
		return float64(v), true
	case uint64:
		return float64(v), true
	case uintptr:
		return float64(v), true
	case json.Number:
		if f, err := v.Float64(); err == nil {
			return f, true
		}
	case string:
		if vfloat64, err := strconv.ParseFloat(v, 64); err == nil {
			return vfloat64, true
		}
	case *float64:
		if v != nil {
			return *v, true
		}
	case *float32:
		if v != nil {
			return float64(*v), true
		}
	case *int:
		if v != nil {
			return float64(*v), true
		}
	case *int8:
		if v != nil {
			return float64(*v), true
		}
	case *int16:
		if v != nil {
			return float64(*v), true
		}
	case *int32:
		if v != nil {
			return float64(*v), true
		}
	case *int64:
		if v != nil {
			return float64(*v), true
		}
	case *uint:
		if v != nil {
			return float64(*v), true
		}
	case *uint8:
		if v != nil {
			return float64(*v), true
		}
	case *uint16:
		if v != nil {
			return float64(*v), true
		}
	case *uint32:
		if v != nil {
			return float64(*v), true
		}
	case *uint64:
		if v != nil {
			return float64(*v), true
		}
	case *uintptr:
		if v != nil {
			return float64(*v), true
		}
	case *json.Number:
		if v != nil {
			if f, err := v.Float64(); err == nil {
				return f, true
			}
		}
	case *string:
		if v != nil {
			if vfloat64, err := strconv.ParseFloat(*v, 64); err == nil {
				return vfloat64, true
			}
		}
	}
	return nil, false
}

func (*propertyNumber) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyNumber) Validate(i interface{}) bool {
	_, ok := i.(float64)
	return ok
}

func (v *Value) ValueNumber() (vv float64, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(float64)
	return
}
