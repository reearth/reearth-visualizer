package value

import (
	"encoding/json"
)

var TypeMap Type = "map"

type propertyMap struct{}

func (p *propertyMap) I2V(i interface{}) (interface{}, bool) {
	switch v := i.(type) {
	case map[string]interface{}:
		return v, true
	case *map[string]interface{}:
		if v != nil {
			return *v, true
		}
	case string:
		var result map[string]interface{}
		if err := json.Unmarshal([]byte(v), &result); err == nil {
			return result, true
		}
	}
	return nil, false
}

func (*propertyMap) V2I(v interface{}) (interface{}, bool) {
	_, ok := v.(map[string]interface{})
	return v, ok
}

func (*propertyMap) Validate(i interface{}) bool {
	_, ok := i.(map[string]interface{})
	return ok
}

func (p *propertyMap) String(i any) string {
	if validMap, ok := i.(map[string]interface{}); ok {
		str, err := json.Marshal(validMap)
		if err == nil {
			return string(str)
		}
	}
	return ""
}

func (p *propertyMap) JSONSchema() map[string]any {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": true,
	}
}

func (v *Value) ValueMap() (vv map[string]interface{}, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(map[string]interface{})
	return
}
