package value

type Optional struct {
	t Type
	v *Value
}

func NewOptional(t Type, v *Value) *Optional {
	if t == TypeUnknown || (v != nil && v.Type() != t) {
		return nil
	}
	return &Optional{
		t: t,
		v: v,
	}
}

func OptionalFrom(v *Value) *Optional {
	if v.Type() == TypeUnknown {
		return nil
	}
	return &Optional{
		t: v.Type(),
		v: v,
	}
}

func (ov *Optional) Type() Type {
	if ov == nil {
		return TypeUnknown
	}
	return ov.t
}

func (ov *Optional) Value() *Value {
	if ov == nil || ov.t == TypeUnknown || ov.v == nil {
		return nil
	}
	return ov.v.Clone()
}

func (ov *Optional) TypeAndValue() (Type, *Value) {
	return ov.Type(), ov.Value()
}

func (ov *Optional) SetValue(v *Value) {
	if ov == nil || ov.t == TypeUnknown || (v != nil && ov.t != v.Type()) {
		return
	}
	ov.v = v.Clone()
}

func (ov *Optional) Clone() *Optional {
	if ov == nil {
		return nil
	}
	return &Optional{
		t: ov.t,
		v: ov.v.Clone(),
	}
}

// Cast tries to convert the value to the new type and generates a new Optional.
func (ov *Optional) Cast(t Type, p TypePropertyMap) *Optional {
	if ov == nil || ov.t == TypeUnknown {
		return nil
	}
	if ov.v == nil {
		return NewOptional(t, nil)
	}

	nv := ov.v.Cast(t, p)
	return NewOptional(t, nv)
}
