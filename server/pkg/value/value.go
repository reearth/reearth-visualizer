package value

import (
	"encoding/json"
)

type Value struct {
	PField TypePropertyMap `msgpack:"PField"`
	VField interface{}     `msgpack:"VField"`
	TField Type            `msgpack:"TField"`
}

func (v *Value) IsEmpty() bool {
	return v == nil || v.TField == TypeUnknown || v.VField == nil
}

func (v *Value) Clone() *Value {
	if v.IsEmpty() {
		return nil
	}
	return v.TField.ValueFrom(v.VField, v.PField)
}

func (v *Value) Some() *Optional {
	return OptionalFrom(v)
}

func (v *Value) Value() interface{} {
	if v == nil {
		return nil
	}
	return v.VField
}

func (v *Value) Type() Type {
	if v == nil {
		return TypeUnknown
	}
	return v.TField
}

func (v *Value) TypeProperty() (tp TypeProperty) {
	if v.IsEmpty() {
		return
	}
	if v.PField != nil {
		if tp, ok := v.PField[v.TField]; ok {
			return tp
		}
	}
	if tp, ok := defaultTypes[v.TField]; ok {
		return tp
	}
	return
}

// Interface converts the value into generic representation
func (v *Value) Interface() interface{} {
	if v == nil || v.TField == TypeUnknown {
		return nil
	}

	if tp := v.TypeProperty(); tp != nil {
		if i, ok2 := tp.V2I(v.VField); ok2 {
			return i
		}
	}

	return nil
}

func (v *Value) String() string {
	if v == nil || v.TField == TypeUnknown {
		return ""
	}

	if tp := v.TypeProperty(); tp != nil {
		return tp.String(v.VField)
	}

	return ""
}

func (v *Value) Validate() bool {
	if v == nil || v.TField == TypeUnknown {
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
	if v == nil || v.TField == TypeUnknown {
		return nil
	}
	if v.TField == t {
		return v.Clone()
	}
	return t.ValueFrom(v.VField, p)
}
