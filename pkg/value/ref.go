package value

import "github.com/reearth/reearth-backend/pkg/id"

var TypeRef Type = "ref"

type propertyRef struct{}

func (*propertyRef) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(string); ok {
		return v, true
	}
	if v, ok := i.(*string); ok {
		return *v, true
	}
	if v, ok := i.(id.ID); ok {
		return v.String(), true
	}
	if v, ok := i.(*id.ID); ok && v != nil {
		return v.String(), true
	}
	return nil, false
}

func (*propertyRef) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyRef) Validate(i interface{}) bool {
	_, ok := i.(string)
	return ok
}

func (v *Value) ValueRef() (vv string, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(string)
	return
}
