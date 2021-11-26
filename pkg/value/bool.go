package value

var TypeBool Type = "bool"

type propertyBool struct{}

func (*propertyBool) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(bool); ok {
		return v, true
	}
	if v, ok := i.(*bool); ok && v != nil {
		return *v, true
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
