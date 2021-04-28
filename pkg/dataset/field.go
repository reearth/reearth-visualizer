package dataset

import "github.com/reearth/reearth-backend/pkg/id"

// Field _
type Field struct {
	field  id.DatasetSchemaFieldID
	dtype  ValueType
	value  *Value
	source Source
}

// NewField _
func NewField(field id.DatasetSchemaFieldID, value *Value, source Source) *Field {
	return &Field{
		dtype:  value.Type(),
		field:  field,
		value:  value,
		source: source,
	}
}

// Field _
func (d *Field) Field() (i id.DatasetSchemaFieldID) {
	if d == nil {
		return
	}
	return d.field
}

// FieldRef _
func (d *Field) FieldRef() *id.DatasetSchemaFieldID {
	if d == nil {
		return nil
	}
	return d.field.Ref()
}

// Type _
func (d *Field) Type() (v ValueType) {
	if d == nil {
		return
	}
	return d.dtype
}

// Value _
func (d *Field) Value() *Value {
	if d == nil {
		return nil
	}
	return d.value
}

// Source _
func (d *Field) Source() (s Source) {
	if d == nil {
		return
	}
	return d.source
}
