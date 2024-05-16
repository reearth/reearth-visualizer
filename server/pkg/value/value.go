package value

import (
	"encoding/json"
)

type Value struct {
	p TypePropertyMap
	v interface{}
	t Type
}

func New(
	p TypePropertyMap,
	v interface{},
	t Type,
) *Value {
	if t == TypeUnknown {
		return nil
	}
	return &Value{
		p: p,
		v: v,
		t: t,
	}
}

func (v *Value) IsEmpty() bool {
	return v == nil || v.t == TypeUnknown || v.v == nil
}

func (v *Value) Clone() *Value {
	if v.IsEmpty() {
		return nil
	}
	return v.t.ValueFrom(v.v, v.p)
}

func (v *Value) Some() *Optional {
	return OptionalFrom(v)
}

func (v *Value) Value() interface{} {
	if v == nil {
		return nil
	}
	return v.v
}

func (v *Value) Type() Type {
	if v == nil {
		return TypeUnknown
	}
	return v.t
}

func (v *Value) TypeProperty() (tp TypeProperty) {
	if v.IsEmpty() {
		return
	}
	if v.p != nil {
		if tp, ok := v.p[v.t]; ok {
			return tp
		}
	}
	if tp, ok := defaultTypes[v.t]; ok {
		return tp
	}
	return
}

// Interface converts the value into generic representation
func (v *Value) Interface() interface{} {
	if v == nil || v.t == TypeUnknown {
		return nil
	}

	if tp := v.TypeProperty(); tp != nil {
		if i, ok2 := tp.V2I(v.v); ok2 {
			return i
		}
	}

	return nil
}

func (v *Value) String() string {
	if v == nil || v.t == TypeUnknown {
		return ""
	}

	if tp := v.TypeProperty(); tp != nil {
		return tp.String(v.v)
	}

	return ""
}

func (v *Value) Validate() bool {
	if v == nil || v.t == TypeUnknown {
		return false
	}

	if tp := v.TypeProperty(); tp != nil {
		return tp.Validate(v)
	}

	return false
}

func (v *Value) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.Interface())
}

func (v *Value) Cast(t Type, p TypePropertyMap) *Value {
	if v == nil || v.t == TypeUnknown {
		return nil
	}
	if v.t == t {
		return v.Clone()
	}
	return t.ValueFrom(v.v, p)
}
