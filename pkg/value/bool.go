package value

import "strconv"

var TypeBool Type = "bool"

type propertyBool struct{}

func (*propertyBool) I2V(i interface{}) (interface{}, bool) {
	switch v := i.(type) {
	case bool:
		return v, true
	case string:
		if b, err := strconv.ParseBool(v); err == nil {
			return b, true
		}
	case *bool:
		if v != nil {
			return *v, true
		}
	case *string:
		if v != nil {
			if b, err := strconv.ParseBool(*v); err == nil {
				return b, true
			}
		}
	}
	return nil, false
}

func (*propertyBool) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyBool) Validate(i interface{}) bool {
	_, ok := i.(bool)
	return ok
}

func (v *Value) ValueBool() (vv bool, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(bool)
	return
}
