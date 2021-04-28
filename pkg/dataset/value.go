package dataset

import (
	"net/url"

	"github.com/mitchellh/mapstructure"
	"github.com/reearth/reearth-backend/pkg/id"
)

// LatLng _
type LatLng struct {
	Lat float64 `mapstructure:"lat"`
	Lng float64 `mapstructure:"lng"`
}

// LatLngFrom _
func LatLngFrom(m interface{}) (LatLng, bool) {
	l := LatLng{}
	err := mapstructure.Decode(m, &l)
	return l, err == nil
}

// LatLngHeight _
type LatLngHeight struct {
	Lat    float64 `mapstructure:"lat"`
	Lng    float64 `mapstructure:"lng"`
	Height float64 `mapstructure:"height"`
}

// LatLngHeightFrom _
func LatLngHeightFrom(m interface{}) (LatLngHeight, bool) {
	l := LatLngHeight{}
	err := mapstructure.Decode(m, &l)
	return l, err == nil
}

// ValueType _
type ValueType string

const (
	// ValueTypeBool _
	ValueTypeBool ValueType = "bool"
	// ValueTypeNumber _
	ValueTypeNumber ValueType = "number"
	// ValueTypeString _
	ValueTypeString ValueType = "string"
	// ValueTypeRef _
	ValueTypeRef ValueType = "ref"
	// ValueTypeURL _
	ValueTypeURL ValueType = "url"
	// ValueTypeLatLng _
	ValueTypeLatLng ValueType = "latlng"
	// ValueTypeLatLngHeight _
	ValueTypeLatLngHeight ValueType = "latlngheight"
)

// ValueTypeFrom _
func ValueTypeFrom(t string) (ValueType, bool) {
	switch ValueType(t) {
	case ValueTypeBool:
		return ValueTypeBool, true
	case ValueTypeNumber:
		return ValueTypeNumber, true
	case ValueTypeString:
		return ValueTypeString, true
	case ValueTypeRef:
		return ValueTypeRef, true
	case ValueTypeURL:
		return ValueTypeURL, true
	case ValueTypeLatLng:
		return ValueTypeLatLng, true
	case ValueTypeLatLngHeight:
		return ValueTypeLatLngHeight, true
	}
	return ValueType(""), false
}

// Validate _
func (t ValueType) Validate() (ValueType, bool) {
	switch t {
	case ValueTypeBool:
		fallthrough
	case ValueTypeNumber:
		fallthrough
	case ValueTypeString:
		fallthrough
	case ValueTypeRef:
		fallthrough
	case ValueTypeURL:
		fallthrough
	case ValueTypeLatLng:
		fallthrough
	case ValueTypeLatLngHeight:
		return t, true
	}
	return t, false
}

// Value _
type Value struct {
	v interface{}
	t ValueType
}

// Value _
func (v *Value) Value() interface{} {
	if v == nil {
		return nil
	}
	return v.v
}

// ValueBool  _
func (v *Value) ValueBool() *bool {
	if v == nil {
		return nil
	}
	if v2, ok := v.v.(bool); ok {
		return &v2
	}
	return nil
}

// ValueNumber _
func (v *Value) ValueNumber() *float64 {
	if v == nil {
		return nil
	}
	if v2, ok := v.v.(float64); ok {
		return &v2
	}
	return nil
}

// ValueString  _
func (v *Value) ValueString() *string {
	if v == nil {
		return nil
	}
	if v2, ok := v.v.(string); ok {
		return &v2
	}
	return nil
}

// ValueRef _
func (v *Value) ValueRef() *id.ID {
	if v == nil {
		return nil
	}
	if v2, ok := v.v.(id.ID); ok {
		return &v2
	}
	return nil
}

// ValueURL  _
func (v *Value) ValueURL() *url.URL {
	if v == nil {
		return nil
	}
	if v2, ok := v.v.(*url.URL); ok {
		return v2
	}
	return nil
}

// ValueLatLng  _
func (v *Value) ValueLatLng() *LatLng {
	if v == nil {
		return nil
	}
	if v2, ok := v.v.(LatLng); ok {
		return &v2
	}
	return nil
}

// ValueLatLngHeight  _
func (v *Value) ValueLatLngHeight() *LatLngHeight {
	if v == nil {
		return nil
	}
	if v2, ok := v.v.(LatLngHeight); ok {
		return &v2
	}
	return nil
}

// Type _
func (v *Value) Type() ValueType {
	if v == nil {
		return ValueType("")
	}
	return v.t
}

// ValueFrom _
func (t ValueType) ValueFrom(v interface{}) *Value {
	if v == nil {
		return nil
	}
	switch t {
	case ValueTypeBool:
		if v2, ok := v.(bool); ok {
			return &Value{v: v2, t: ValueTypeBool}
		}
	case ValueTypeNumber:
		if v2, ok := v.(float64); ok {
			return &Value{v: v2, t: ValueTypeNumber}
		}
		if v2, ok := v.(int); ok {
			return &Value{v: float64(v2), t: ValueTypeNumber}
		}
	case ValueTypeString:
		if v2, ok := v.(string); ok {
			return &Value{v: v2, t: ValueTypeString}
		}
	case ValueTypeRef:
		if v2, ok := v.(id.ID); ok {
			return &Value{v: v2, t: ValueTypeRef}
		}
		if v2, ok := v.(string); ok {
			if id, err := id.NewIDWith(v2); err == nil {
				return &Value{v: id, t: ValueTypeRef}
			}
		}
	case ValueTypeURL:
		if v2, ok := v.(*url.URL); ok {
			return &Value{v: v2, t: ValueTypeURL}
		}
		if v2, ok := v.(string); ok {
			if u, err := url.Parse(v2); err == nil {
				return &Value{v: u, t: ValueTypeURL}
			}
		}
	case ValueTypeLatLng:
		if v2, ok := v.(LatLng); ok {
			return &Value{v: v2, t: ValueTypeLatLng}
		} else if v2, ok := v.(*LatLng); ok {
			if v2 == nil {
				return nil
			}
			return &Value{v: *v2, t: ValueTypeLatLng}
		}
		v2 := LatLng{}
		if err := mapstructure.Decode(v, &v2); err != nil {
			return nil
		}
		return &Value{v: v2, t: ValueTypeLatLng}
	case ValueTypeLatLngHeight:
		if v2, ok := v.(LatLngHeight); ok {
			return &Value{v: v2, t: ValueTypeLatLngHeight}
		} else if v2, ok := v.(*LatLngHeight); ok {
			if v2 == nil {
				return nil
			}
			return &Value{v: *v2, t: ValueTypeLatLngHeight}
		}
		v2 := LatLngHeight{}
		if err := mapstructure.Decode(v, &v2); err != nil {
			return nil
		}
		return &Value{v: v2, t: ValueTypeLatLng}
	}
	return nil
}

// ValidateValue _
func (t ValueType) ValidateValue(v *Value) bool {
	if v == nil {
		return true
	}
	vv := v.Value()
	if vv == nil {
		return true
	}
	switch t {
	case ValueTypeBool:
		if _, ok := vv.(bool); ok {
			return true
		}
	case ValueTypeNumber:
		if _, ok := vv.(float64); ok {
			return true
		}
	case ValueTypeString:
		if _, ok := vv.(string); ok {
			return true
		}
	case ValueTypeRef:
		if _, ok := vv.(id.ID); ok {
			return true
		}
	case ValueTypeURL:
		if _, ok := vv.(*url.URL); ok {
			return true
		}
	case ValueTypeLatLng:
		if _, ok := vv.(LatLng); ok {
			return true
		}
	case ValueTypeLatLngHeight:
		if _, ok := vv.(LatLngHeight); ok {
			return true
		}
	}
	return false
}

// Clone _
func (v *Value) Clone() *Value {
	if v == nil {
		return nil
	}
	var v3 interface{}
	switch v2 := v.v.(type) {
	case bool:
		v3 = v2
	case float64:
		v3 = v2
	case string:
		v3 = v2
	case id.ID:
		v3 = v2
	case *url.URL:
		v3, _ = url.Parse(v2.String())
	case LatLng:
		v3 = LatLng{Lat: v2.Lat, Lng: v2.Lng}
	case LatLngHeight:
		v3 = LatLngHeight{Lat: v2.Lat, Lng: v2.Lng, Height: v2.Height}
	}
	return &Value{v: v3, t: v.t}
}

// ValueFrom _
func ValueFrom(v interface{}) *Value {
	if v == nil {
		return nil
	}
	switch v2 := v.(type) {
	case bool:
		return &Value{v: v2, t: ValueTypeBool}
	case int:
		return &Value{v: float64(v2), t: ValueTypeNumber}
	case float64:
		return &Value{v: v2, t: ValueTypeNumber}
	case string:
		return &Value{v: v2, t: ValueTypeString}
	case id.ID:
		return &Value{v: v2, t: ValueTypeRef}
	case *url.URL:
		return &Value{v: v2, t: ValueTypeURL}
	case LatLng:
		return &Value{v: v2, t: ValueTypeLatLng}
	case LatLngHeight:
		return &Value{v: v2, t: ValueTypeLatLngHeight}
	}
	return nil
}

// Interface converts the value into generic representation
func (v *Value) Interface() interface{} {
	if v == nil {
		return nil
	}
	switch v2 := v.Value().(type) {
	case bool:
		return v2
	case float64:
		return v2
	case string:
		return v2
	case id.ID:
		return v2.String()
	case *url.URL:
		return v2.String()
	case LatLng:
		return encodeValue(&v2)
	case LatLngHeight:
		return encodeValue(&v2)
	}
	return nil
}

func encodeValue(v interface{}) map[string]interface{} {
	var v3 map[string]interface{}
	err := mapstructure.Decode(v, &v3)
	if err != nil {
		return nil
	}
	return v3
}
