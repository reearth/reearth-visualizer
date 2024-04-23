package value

type Optional struct {
	TField Type   `msgpack:"FieldField"`
	VField *Value `msgpack:"ValueField"`
}

func NewOptional(t Type, v *Value) *Optional {
	if t == TypeUnknown || (v != nil && v.Type() != t) {
		return nil
	}
	return &Optional{
		TField: t,
		VField: v,
	}
}

func OptionalFrom(v *Value) *Optional {
	if v.Type() == TypeUnknown {
		return nil
	}
	return &Optional{
		TField: v.Type(),
		VField: v,
	}
}

func (ov *Optional) Type() Type {
	if ov == nil {
		return TypeUnknown
	}
	return ov.TField
}

func (ov *Optional) Value() *Value {
	if ov == nil || ov.TField == TypeUnknown || ov.VField == nil {
		return nil
	}
	return ov.VField.Clone()
}

func (ov *Optional) TypeAndValue() (Type, *Value) {
	return ov.Type(), ov.Value()
}

func (ov *Optional) SetValue(v *Value) {
	if ov == nil || ov.TField == TypeUnknown || (v != nil && ov.TField != v.Type()) {
		return
	}
	ov.VField = v.Clone()
}

func (ov *Optional) Clone() *Optional {
	if ov == nil {
		return nil
	}
	return &Optional{
		TField: ov.TField,
		VField: ov.VField.Clone(),
	}
}

// Cast tries to convert the value to the new type and generates a new Optional.
func (ov *Optional) Cast(t Type, p TypePropertyMap) *Optional {
	if ov == nil || ov.TField == TypeUnknown {
		return nil
	}
	if ov.VField == nil {
		return NewOptional(t, nil)
	}

	nv := ov.VField.Cast(t, p)
	return NewOptional(t, nv)
}
