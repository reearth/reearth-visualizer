package value

import (
	"fmt"
	"strconv"
)

var TypeString Type = "string"

type propertyString struct{}

func (*propertyString) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(string); ok {
		return v, true
	} else if v, ok := i.(*string); ok && v != nil {
		return *v, true
	} else if v, ok := i.(float64); ok {
		return strconv.FormatFloat(v, 'f', -1, 64), true
	} else if v, ok := i.(*float64); ok && v != nil {
		return strconv.FormatFloat(*v, 'f', -1, 64), true
	} else if v, ok := i.(fmt.Stringer); ok && v != nil {
		return v.String(), true
	}
	return nil, false
}

func (*propertyString) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyString) Validate(i interface{}) bool {
	_, ok := i.(string)
	return ok
}

func (v *Value) ValueString() (vv string, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(string)
	return
}
