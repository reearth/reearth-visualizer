package dataset

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
	ValueTypeRect         = ValueType(value.TypeRect)
	TypePolygon           = ValueType(value.TypePolygon)
)

func (vt ValueType) Valid() bool {
	return value.Type(vt).Default()
}

func (t ValueType) Default() bool {
	return value.Type(t).Default()
}

func (t ValueType) ValueFrom(i interface{}) *Value {
	vv := value.Type(t).ValueFrom(i, nil)
	if vv == nil {
		return nil
	}
	return &Value{v: *vv}
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

func (vt ValueType) JSONSchema() map[string]any {
	return value.Type(vt).JSONSchema(nil)
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
		return ValueTypeUnknown
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
	nv := v.v.Cast(value.Type(vt), nil)
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

func (v *Value) String() string {
	if v == nil {
		return ""
	}
	return v.v.String()
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
