package property

import (
	"encoding/json"
	"fmt"
	"net/url"

	"github.com/mitchellh/mapstructure"
	"github.com/reearth/reearth-backend/pkg/id"
)

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
	// ValueTypeCamera _
	ValueTypeCamera ValueType = "camera"
	// ValueTypeTypography _
	ValueTypeTypography ValueType = "typography"
	// ValueTypeCoordinates _
	ValueTypeCoordinates ValueType = "coordinates"
	// ValueTypePolygon
	ValueTypePolygon ValueType = "polygon"
	// ValueTypeRect
	ValueTypeRect ValueType = "rect"
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
	case ValueTypeCamera:
		return ValueTypeCamera, true
	case ValueTypeTypography:
		return ValueTypeTypography, true
	case ValueTypeCoordinates:
		return ValueTypeCoordinates, true
	case ValueTypePolygon:
		return ValueTypePolygon, true
	case ValueTypeRect:
		return ValueTypeRect, true
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
		fallthrough
	case ValueTypeCamera:
		fallthrough
	case ValueTypeTypography:
		fallthrough
	case ValueTypeCoordinates:
		fallthrough
	case ValueTypePolygon:
		fallthrough
	case ValueTypeRect:
		return t, true
	}
	return t, false
}

// Value _
type Value struct {
	v interface{}
	t ValueType
}

// IsEmpty _
func (v *Value) IsEmpty() bool {
	return v == nil || v.v == nil
}

// Clone _
func (v *Value) Clone() *Value {
	if v == nil {
		return nil
	}
	return v.t.ValueFromUnsafe(v.v)
}

// Value _
func (v *Value) Value() interface{} {
	if v == nil {
		return nil
	}
	return v.v
}

// ValueBool  _
func (v *Value) ValueBool() (vv bool, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(bool)
	return
}

// ValueNumber _
func (v *Value) ValueNumber() (vv float64, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(float64)
	return
}

// ValueString  _
func (v *Value) ValueString() (vv string, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(string)
	return
}

// ValueRef _
func (v *Value) ValueRef() (vv id.ID, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(id.ID)
	return
}

// ValueURL  _
func (v *Value) ValueURL() (vv *url.URL, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(*url.URL)
	return
}

// ValueLatLng  _
func (v *Value) ValueLatLng() (vv LatLng, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(LatLng)
	return
}

// ValueLatLngHeight  _
func (v *Value) ValueLatLngHeight() (vv LatLngHeight, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(LatLngHeight)
	return
}

// ValueCamera  _
func (v *Value) ValueCamera() (vv Camera, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Camera)
	return
}

// ValueTypography  _
func (v *Value) ValueTypography() (vv Typography, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Typography)
	return
}

// ValueCoordinates  _
func (v *Value) ValueCoordinates() (vv Coordinates, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Coordinates)
	return
}

// ValuePolygon  _
func (v *Value) ValuePolygon() (vv Polygon, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Polygon)
	return
}

// ValueRect  _
func (v *Value) ValueRect() (vv Rect, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Rect)
	return
}

// Type _
func (v *Value) Type() ValueType {
	if v == nil {
		return ValueType("")
	}
	return v.t
}

// ValueFromUnsafe _
func (t ValueType) ValueFromUnsafe(v interface{}) *Value {
	v2, _ := t.ValueFrom(v)
	return v2
}

func (t ValueType) MustBeValue(v interface{}) *Value {
	v2, ok := t.ValueFrom(v)
	if !ok {
		panic("incompatible value for property value")
	}
	return v2
}

// ValueFrom _
func (t ValueType) ValueFrom(v interface{}) (*Value, bool) {
	if t == "" {
		return nil, false
	}
	if v == nil {
		return nil, true
	}

	switch t {
	case ValueTypeBool:
		if v2, ok := v.(bool); ok {
			return &Value{v: v2, t: ValueTypeBool}, true
		}
	case ValueTypeNumber:
		if v2, ok := v.(json.Number); ok {
			if v3, err := v2.Float64(); err == nil {
				return &Value{v: v3, t: ValueTypeNumber}, true
			}
		} else if v2, ok := v.(float64); ok {
			return &Value{v: v2, t: ValueTypeNumber}, true
		} else if v2, ok := v.(int); ok {
			return &Value{v: float64(v2), t: ValueTypeNumber}, true
		}
	case ValueTypeString:
		if v2, ok := v.(string); ok {
			return &Value{v: v2, t: ValueTypeString}, true
		}
	case ValueTypeRef:
		if v2, ok := v.(id.ID); ok {
			return &Value{v: v2, t: ValueTypeRef}, true
		} else if v2, ok := v.(string); ok {
			if id, err := id.NewIDWith(v2); err == nil {
				return &Value{v: id, t: ValueTypeRef}, true
			}
		}
	case ValueTypeURL:
		if v2, ok := v.(*url.URL); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: v2, t: ValueTypeURL}, true
		} else if v2, ok := v.(string); ok {
			if u, err := url.Parse(v2); err == nil {
				return &Value{v: u, t: ValueTypeURL}, true
			}
		}
	case ValueTypeLatLng:
		if v2, ok := v.(LatLng); ok {
			return &Value{v: v2, t: ValueTypeLatLng}, true
		} else if v2, ok := v.(*LatLng); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: *v2, t: ValueTypeLatLng}, true
		}
		v2 := LatLng{}
		if err := mapstructure.Decode(v, &v2); err != nil {
			return nil, false
		}
		return &Value{v: v2, t: ValueTypeLatLng}, true
	case ValueTypeLatLngHeight:
		if v2, ok := v.(LatLngHeight); ok {
			return &Value{v: v2, t: ValueTypeLatLngHeight}, true
		} else if v2, ok := v.(*LatLngHeight); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: *v2, t: ValueTypeLatLngHeight}, true
		}
		v2 := LatLngHeight{}
		if err := mapstructure.Decode(v, &v2); err != nil {
			return nil, false
		}
		return &Value{v: v2, t: ValueTypeLatLngHeight}, true
	case ValueTypeCamera:
		if v2, ok := v.(Camera); ok {
			return &Value{v: v2, t: ValueTypeCamera}, true
		} else if v2, ok := v.(*Camera); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: *v2, t: ValueTypeCamera}, true
		}
		v2 := Camera{}
		if err := mapstructure.Decode(v, &v2); err != nil {
			return nil, false
		}
		return &Value{v: v2, t: ValueTypeCamera}, true
	case ValueTypeTypography:
		if v2, ok := v.(Typography); ok {
			return &Value{v: v2, t: ValueTypeTypography}, true
		} else if v2, ok := v.(*Typography); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: *v2, t: ValueTypeTypography}, true
		}
		v2 := Typography{}
		if err := mapstructure.Decode(v, &v2); err != nil {
			return nil, false
		}
		return &Value{v: v2, t: ValueTypeTypography}, true
	case ValueTypeCoordinates:
		if v2, ok := v.(Coordinates); ok {
			return &Value{v: v2, t: ValueTypeCoordinates}, true
		} else if v2, ok := v.(*Coordinates); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: *v2, t: ValueTypeCoordinates}, true
		} else if v2, ok := v.([]float64); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: CoordinatesFrom(v2), t: ValueTypeCoordinates}, true
		}

		v2 := []float64{}
		if err := mapstructure.Decode(v, &v2); err == nil {
			return &Value{v: CoordinatesFrom(v2), t: ValueTypeCoordinates}, true
		}

		v3 := Coordinates{}
		if err := mapstructure.Decode(v, &v3); err != nil {
			return nil, false
		}
		return &Value{v: v3, t: ValueTypeCoordinates}, true
	case ValueTypePolygon:
		if v2, ok := v.(Polygon); ok {
			return &Value{v: v2, t: ValueTypePolygon}, true
		} else if v2, ok := v.(*Polygon); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: *v2, t: ValueTypePolygon}, true
		}
		v2 := Polygon{}
		if err := mapstructure.Decode(v, &v2); err != nil {
			return nil, false
		}
		return &Value{v: v2, t: ValueTypePolygon}, true
	case ValueTypeRect:
		if v2, ok := v.(Rect); ok {
			return &Value{v: v2, t: ValueTypeRect}, true
		} else if v2, ok := v.(*Rect); ok {
			if v2 == nil {
				return nil, false
			}
			return &Value{v: *v2, t: ValueTypeRect}, true
		}
		v2 := Rect{}
		if err := mapstructure.Decode(v, &v2); err != nil {
			return nil, false
		}
		return &Value{v: v2, t: ValueTypeRect}, true
	}
	return nil, false
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
	case ValueTypeCamera:
		if _, ok := vv.(Camera); ok {
			return true
		}
	case ValueTypeTypography:
		if _, ok := vv.(Typography); ok {
			return true
		}
	case ValueTypeCoordinates:
		if _, ok := vv.(Coordinates); ok {
			return true
		}
	case ValueTypePolygon:
		if _, ok := vv.(Polygon); ok {
			return true
		}
	case ValueTypeRect:
		if _, ok := vv.(Rect); ok {
			return true
		}
	}
	return false
}

func (t *ValueType) MarshalJSON() ([]byte, error) {
	if t == nil {
		return nil, nil
	}
	return json.Marshal(string(*t))
}

func (t *ValueType) UnmarshalJSON(bs []byte) (err error) {
	var vtstr string
	if err = json.Unmarshal(bs, &vtstr); err != nil {
		return
	}
	var ok bool
	*t, ok = ValueTypeFrom(vtstr)
	if !ok {
		return fmt.Errorf("invalid property value type: %s", vtstr)
	}
	return
}

func (t *ValueType) MarshalText() ([]byte, error) {
	if t == nil {
		return nil, nil
	}
	return []byte(*t), nil
}

func (t *ValueType) UnmarshalText(text []byte) (err error) {
	var ok bool
	*t, ok = ValueTypeFrom(string(text))
	if !ok {
		return fmt.Errorf("invalid property value type: %s", text)
	}
	return
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
		var v3 map[string]interface{}
		if err := mapstructure.Decode(&v2, &v3); err != nil {
			return nil
		}
		return v3
	case LatLngHeight:
		var v3 map[string]interface{}
		if err := mapstructure.Decode(&v2, &v3); err != nil {
			return nil
		}
		return v3
	case Camera:
		var v3 map[string]interface{}
		if err := mapstructure.Decode(&v2, &v3); err != nil {
			return nil
		}
		return v3
	case Typography:
		var v3 map[string]interface{}
		if err := mapstructure.Decode(&v2, &v3); err != nil {
			return nil
		}
		return v3
	case Coordinates:
		var v3 []map[string]interface{}
		if err := mapstructure.Decode(&v2, &v3); err != nil {
			return nil
		}
		return v3
	case Polygon:
		var v3 [][]map[string]interface{}
		if err := mapstructure.Decode(&v2, &v3); err != nil {
			return nil
		}
		return v3
	case Rect:
		var v3 map[string]interface{}
		if err := mapstructure.Decode(&v2, &v3); err != nil {
			return nil
		}
		return v3
	}
	return nil
}

func (v *Value) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.Interface())
}
