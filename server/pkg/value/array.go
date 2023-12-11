package value

import (
	"encoding/json"
)

var TypeArray Type = "array"

type propertyArray struct{}

func (p *propertyArray) I2V(i interface{}) (interface{}, bool) {
	switch v := i.(type) {
	case []any:
		return v, true
	case *[]any:
		if v != nil {
			return *v, true
		}
	case string:
		var result []any
		if err := json.Unmarshal([]byte(v), &result); err == nil {
			return result, true
		}
	}
	return nil, false
}

func (*propertyArray) V2I(v interface{}) (interface{}, bool) {
	_, ok := v.([]any)
	return v, ok
}

func (*propertyArray) Validate(i interface{}) bool {
	_, ok := i.([]any)
	return ok
}

func (p *propertyArray) String(i any) string {
	if validArray, ok := i.([]any); ok {
		str, err := json.Marshal(validArray)
		if err == nil {
			return string(str)
		}
	}
	return ""
}

func (p *propertyArray) JSONSchema() map[string]any {
	return map[string]any{
		"type":  "array",
		"items": map[string]any{"type": "object"}, // Assuming array items are generic objects
	}
}

func (v *Value) ValueArray() (vv []any, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.([]any)
	return
}
