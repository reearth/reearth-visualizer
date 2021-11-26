package value

type OptionalValue struct {
	t Type
	v *Value
}

func NewOptionalValue(t Type, v *Value) *OptionalValue {
	if t == TypeUnknown || (v != nil && v.Type() != t) {
		return nil
	}
	return &OptionalValue{
		t: t,
		v: v,
	}
}

func OptionalValueFrom(v *Value) *OptionalValue {
	if v.Type() == TypeUnknown {
		return nil
	}
	return &OptionalValue{
		t: v.Type(),
		v: v,
	}
}

func (ov *OptionalValue) Type() Type {
	if ov == nil {
		return TypeUnknown
	}
	return ov.t
}

func (ov *OptionalValue) Value() *Value {
	if ov == nil || ov.t == TypeUnknown || ov.v == nil {
		return nil
	}
	return ov.v.Clone()
}

func (ov *OptionalValue) TypeAndValue() (Type, *Value) {
	return ov.Type(), ov.Value()
}

func (ov *OptionalValue) SetValue(v *Value) {
	if ov == nil || ov.t == TypeUnknown || (v != nil && ov.t != v.Type()) {
		return
	}
	ov.v = v.Clone()
}

func (ov *OptionalValue) Clone() *OptionalValue {
	if ov == nil {
		return nil
	}
	return &OptionalValue{
		t: ov.t,
		v: ov.v.Clone(),
	}
}
