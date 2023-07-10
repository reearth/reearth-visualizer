package value

import (
	"encoding/json"
	"fmt"
	"strconv"
)

var TypeNumber Type = "number"

type propertyNumber struct{}

func (p *propertyNumber) I2V(i interface{}) (interface{}, bool) {
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
	case bool:
		if v {
			return float64(1), true
		} else {
			return float64(0), true
		}
	case *float64:
		if v != nil {
			return p.I2V(*v)
		}
	case *float32:
		if v != nil {
			return p.I2V(*v)
		}
	case *int:
		if v != nil {
			return p.I2V(*v)
		}
	case *int8:
		if v != nil {
			return p.I2V(*v)
		}
	case *int16:
		if v != nil {
			return p.I2V(*v)
		}
	case *int32:
		if v != nil {
			return p.I2V(*v)
		}
	case *int64:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint8:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint16:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint32:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint64:
		if v != nil {
			return p.I2V(*v)
		}
	case *uintptr:
		if v != nil {
			return p.I2V(*v)
		}
	case *json.Number:
		if v != nil {
			return p.I2V(*v)
		}
	case *string:
		if v != nil {
			return p.I2V(*v)
		}
	case *bool:
		if v != nil {
			return p.I2V(*v)
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

func (p *propertyNumber) String(i any) string {
	if !p.Validate(i) {
		return ""
	}
	return fmt.Sprintf("%g", i.(float64))
}

func (v *propertyNumber) JSONSchema() map[string]any {
	return map[string]any{
		"type": "number",
	}
}

func (v *Value) ValueNumber() (vv float64, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(float64)
	return
}
