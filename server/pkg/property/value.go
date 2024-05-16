package property

import (
	"net/url"

	"github.com/reearth/reearth/server/pkg/value"
)

type LatLng = value.LatLng
type LatLngHeight = value.LatLngHeight
type Coordinates = value.Coordinates
type Rect = value.Rect
type Polygon = value.Polygon

type ValueType value.Type

var (
	ValueTypeUnknown      = ValueType(value.TypeUnknown)
	ValueTypeBool         = ValueType(value.TypeBool)
	ValueTypeNumber       = ValueType(value.TypeNumber)
	ValueTypeString       = ValueType(value.TypeString)
	ValueTypeRef          = ValueType(value.TypeRef)
	ValueTypeURL          = ValueType(value.TypeURL)
	ValueTypeLatLng       = ValueType(value.TypeLatLng)
	ValueTypeLatLngHeight = ValueType(value.TypeLatLngHeight)
	ValueTypeCoordinates  = ValueType(value.TypeCoordinates)
	ValueTypePolygon      = ValueType(value.TypePolygon)
	ValueTypeRect         = ValueType(value.TypeRect)
	ValueTypeArray        = ValueType(value.TypeArray)
)

var types = value.TypePropertyMap{
	value.Type(ValueTypeTypography): &typePropertyTypography{},
	value.Type(ValueTypeCamera):     &typePropertyCamera{},
	value.Type(ValueTypeSpacing):    &typePropertySpacing{},
	value.Type(ValueTypeTimeline):   &typePropertyTimeline{},
}

func NewValue(v *value.Value) *Value {
	if v == nil {
		return nil
	}

	return &Value{
		v: *v,
	}
}

func (vt ValueType) Valid() bool {
	if _, ok := types[value.Type(vt)]; ok {
		return true
	}
	return value.Type(vt).Default()
}

func (t ValueType) Default() bool {
	if _, ok := types[value.Type(t)]; ok {
		return true
	}
	return value.Type(t).Default()
}

func (vt ValueType) ValueFrom(i interface{}) *Value {
	v := value.Type(vt).ValueFrom(i, types)
	if v == nil {
		return nil
	}
	return &Value{v: *v}
}

func (vt ValueType) MustBeValue(i interface{}) *Value {
	if v := vt.ValueFrom(i); v != nil {
		return v
	}
	panic("invalid value")
}

func (vt ValueType) None() *OptionalValue {
	return NewOptionalValue(vt, nil)
}

type Value struct {
	v value.Value
}

func (v *Value) IsEmpty() bool {
	return v == nil || v.v.IsEmpty()
}

func (v *Value) Clone() *Value {
	if v == nil {
		return nil
	}
	vv := v.v.Clone()
	if vv == nil {
		return nil
	}
	return &Value{v: *vv}
}

func (v *Value) Some() *OptionalValue {
	return OptionalValueFrom(v)
}

func (v *Value) Type() ValueType {
	if v == nil {
		return ValueType(value.TypeUnknown)
	}
	return ValueType(v.v.Type())
}

func (v *Value) Value() interface{} {
	if v == nil {
		return nil
	}
	return v.v.Value()
}

func (v *Value) Interface() interface{} {
	if v == nil {
		return nil
	}
	return v.v.Interface()
}

func (v *Value) Cast(vt ValueType) *Value {
	if v == nil {
		return nil
	}
	nv := v.v.Cast(value.Type(vt), types)
	if nv == nil {
		return nil
	}
	return &Value{v: *nv}
}

func (v *Value) ValueBool() *bool {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueBool()
	if ok {
		return &vv
	}
	return nil
}

func (v *Value) ValueNumber() *float64 {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueNumber()
	if ok {
		return &vv
	}
	return nil
}

func (v *Value) ValueString() *string {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueString()
	if ok {
		return &vv
	}
	return nil
}

func (v *Value) ValueRef() *string {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueRef()
	if ok {
		return &vv
	}
	return nil
}

func (v *Value) ValueURL() *url.URL {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueURL()
	if ok {
		return vv
	}
	return nil
}

func (v *Value) ValueLatLng() *LatLng {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueLatLng()
	if ok {
		return &vv
	}
	return nil
}

func (v *Value) ValueLatLngHeight() *LatLngHeight {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueLatLngHeight()
	if ok {
		return &vv
	}
	return nil
}

func (v *Value) ValueCoordinates() *Coordinates {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueCoordinates()
	if ok {
		return &vv
	}
	return nil
}

func (v *Value) ValueRect() *Rect {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValueRect()
	if ok {
		return &vv
	}
	return nil
}

func (v *Value) ValuePolygon() *Polygon {
	if v == nil {
		return nil
	}
	vv, ok := v.v.ValuePolygon()
	if ok {
		return &vv
	}
	return nil
}

func ValueFromStringOrNumber(s string) *Value {
	if s == "true" || s == "false" || s == "TRUE" || s == "FALSE" || s == "True" || s == "False" {
		return ValueTypeBool.ValueFrom(s)
	}

	if v := ValueTypeNumber.ValueFrom(s); v != nil {
		return v
	}

	return ValueTypeString.ValueFrom(s)
}

func DefaultTypes() value.TypePropertyMap {
	return types
}
