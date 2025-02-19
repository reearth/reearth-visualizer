package property

type ValueAndDatasetValue struct {
	t ValueType
	p *Value
}

func NewValueAndDatasetValue(ty ValueType, p *Value) *ValueAndDatasetValue {
	if !ty.Valid() {
		return nil
	}

	if p != nil && p.Type() != ty {
		p = p.Cast(ty)
	}

	return &ValueAndDatasetValue{
		t: ty,
		p: p,
	}
}

func (v *ValueAndDatasetValue) Type() ValueType {
	if v == nil {
		return ValueTypeUnknown
	}
	return v.t
}

func (v *ValueAndDatasetValue) PropertyValue() *Value {
	if v == nil || v.t == ValueTypeUnknown {
		return nil
	}
	return v.p
}

func (v *ValueAndDatasetValue) Value() *Value {
	if v == nil || v.t == ValueTypeUnknown {
		return nil
	}
	return v.p
}
