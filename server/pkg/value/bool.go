package value

import "strconv"

var TypeBool Type = "bool"

type propertyBool struct{}

func (p *propertyBool) I2V(i interface{}) (interface{}, bool) {
	switch v := i.(type) {
	case bool:
		return v, true
	case string:
		if b, err := strconv.ParseBool(v); err == nil {
			return b, true
		}
	case *bool:
		if v != nil {
			return p.I2V(*v)
		}
	case *string:
		if v != nil {
			return p.I2V(*v)
		}
	}
	return nil, false
}

func (*propertyBool) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*propertyBool) Validate(i interface{}) bool {
	_, ok := i.(bool)
	return ok
}

func (p *propertyBool) String(i any) string {
	if !p.Validate(i) {
		return ""
	}
	return strconv.FormatBool(i.(bool))
}

func (v *propertyBool) JSONSchema() map[string]any {
	return map[string]any{
		"type": "boolean",
	}
}

func (v *Value) ValueBool() (vv bool, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(bool)
	return
}
