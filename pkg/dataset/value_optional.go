package dataset

import "github.com/reearth/reearth-backend/pkg/value"

type OptionalValue struct {
	ov value.OptionalValue
}

func NewOptionalValue(t ValueType, v *Value) *OptionalValue {
	var vv *value.Value
	if v != nil {
		vv = &v.v
	}
	ov := value.NewOptionalValue(value.Type(t), vv)
	if ov == nil {
		return nil
	}
	return &OptionalValue{ov: *ov}
}

func OptionalValueFrom(v *Value) *OptionalValue {
	if v == nil {
		return nil
	}
	ov := value.OptionalValueFrom(&v.v)
	if ov == nil {
		return nil
	}
	return &OptionalValue{
		ov: *ov,
	}
}

func (ov *OptionalValue) Type() ValueType {
	if ov == nil {
		return ValueTypeUnknown
	}
	return ValueType(ov.ov.Type())
}

func (ov *OptionalValue) Value() *Value {
	if ov == nil {
		return nil
	}
	vv := ov.ov.Value()
	if vv == nil {
		return nil
	}
	return &Value{v: *vv}
}

func (ov *OptionalValue) TypeAndValue() (ValueType, *Value) {
	return ov.Type(), ov.Value()
}

func (ov *OptionalValue) SetValue(v *Value) {
	if ov == nil {
		return
	}
	if v == nil {
		ov.ov.SetValue(nil)
	} else {
		ov.ov.SetValue(&v.v)
	}
}

func (ov *OptionalValue) Clone() *OptionalValue {
	if ov == nil {
		return nil
	}
	nov := ov.ov.Clone()
	if nov == nil {
		return nil
	}
	return &OptionalValue{
		ov: *nov,
	}
}
