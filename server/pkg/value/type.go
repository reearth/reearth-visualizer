package value

type Type string

type TypeProperty interface {
	I2V(interface{}) (interface{}, bool)
	V2I(interface{}) (interface{}, bool)
	Validate(interface{}) bool
	String(any) string
	JSONSchema() map[string]any
}

type TypePropertyMap = map[Type]TypeProperty

var TypeUnknown = Type("")

var defaultTypes = TypePropertyMap{
	TypeBool:         &propertyBool{},
	TypeCoordinates:  &propertyCoordinates{},
	TypeLatLng:       &propertyLatLng{},
	TypeLatLngHeight: &propertyLatLngHeight{},
	TypeNumber:       &propertyNumber{},
	TypePolygon:      &propertyPolygon{},
	TypeRect:         &propertyRect{},
	TypeRef:          &propertyRef{},
	TypeString:       &propertyString{},
	TypeURL:          &propertyURL{},
	TypeArray:        &propertyArray{},
}

func (t Type) Default() bool {
	_, ok := defaultTypes[t]
	return ok
}

func (t Type) None() *Optional {
	return NewOptional(t, nil)
}

func (t Type) ValueFrom(i interface{}, p TypePropertyMap) *Value {
	if t == TypeUnknown || i == nil {
		return nil
	}

	if p != nil {
		if vt, ok := p[t]; ok && vt != nil {
			if v, ok2 := vt.I2V(i); ok2 {
				return &Value{p: p, v: v, t: t}
			}
		}
	}

	if vt, ok := defaultTypes[t]; ok && vt != nil {
		if v, ok2 := vt.I2V(i); ok2 {
			return &Value{p: p, v: v, t: t}
		}
	}

	return nil
}

func (vt Type) JSONSchema(p TypePropertyMap) map[string]any {
	if vt == TypeUnknown {
		return nil
	}

	if p != nil {
		if v, ok := p[vt]; ok && v != nil {
			return v.JSONSchema()
		}
	}

	if v, ok := defaultTypes[vt]; ok && v != nil {
		return v.JSONSchema()
	}
	return nil
}
