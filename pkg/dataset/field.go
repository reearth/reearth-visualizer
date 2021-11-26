package dataset

import "github.com/reearth/reearth-backend/pkg/id"

type Field struct {
	field  id.DatasetSchemaFieldID
	value  *Value
	source string
}

func NewField(field id.DatasetSchemaFieldID, value *Value, source string) *Field {
	if value == nil {
		return nil
	}
	return &Field{
		field: field,
		value: value,
	}
}

func (d *Field) Field() (i id.DatasetSchemaFieldID) {
	if d == nil {
		return
	}
	return d.field
}

func (d *Field) FieldRef() *id.DatasetSchemaFieldID {
	if d == nil {
		return nil
	}
	return d.field.Ref()
}

func (d *Field) IsEmpty() bool {
	return d == nil || d.field.IsNil() || d.value == nil
}

func (d *Field) Value() *Value {
	if d == nil {
		return nil
	}
	return d.value.Clone()
}

func (d *Field) Type() ValueType {
	if d == nil {
		return ValueTypeUnknown
	}
	return d.value.Type()
}

func (d *Field) Source() string {
	if d == nil {
		return ""
	}
	return d.source
}
