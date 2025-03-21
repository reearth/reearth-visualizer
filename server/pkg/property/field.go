package property

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
)

var (
	ErrInvalidPropertyValue = errors.New("invalid property value")
	ErrCannotLinkDataset    = errors.New("cannot link dataset")
	ErrInvalidPropertyType  = errors.New("invalid property type")
	ErrInvalidPropertyField = errors.New("invalid property field")
)

type Field struct {
	field id.PropertyFieldID
	v     *OptionalValue
}

func (p *Field) Clone() *Field {
	if p == nil {
		return nil
	}
	return &Field{
		field: p.field,
		v:     p.v.Clone(),
	}
}

func (p *Field) Field() id.PropertyFieldID {
	return p.field
}

func (p *Field) FieldRef() *id.PropertyFieldID {
	if p == nil {
		return nil
	}
	return p.field.Ref()
}

func (p *Field) Type() ValueType {
	if p == nil {
		return ValueTypeUnknown
	}
	return p.v.Type()
}

func (p *Field) Value() *Value {
	if p == nil {
		return nil
	}
	return p.v.Value()
}

func (p *Field) TypeAndValue() *OptionalValue {
	if p == nil {
		return nil
	}
	return p.v
}

func (p *Field) Update(value *Value, field *SchemaField) error {
	if p == nil {
		return nil
	}
	if field == nil || p.field != field.ID() || !field.Validate(p.v) {
		return ErrInvalidPropertyValue
	}
	p.v.SetValue(value)
	return nil
}

func (p *Field) UpdateUnsafe(value *Value) {
	if p == nil {
		return
	}
	p.v.SetValue(value)
}

func (p *Field) Cast(t ValueType) bool {
	if p == nil || t == ValueTypeUnknown || p.Type() == ValueTypeUnknown || p.Type() == t {
		return false
	}
	p.v = p.v.Cast(t)

	return true
}

func (p *Field) UpdateField(field id.PropertyFieldID) {
	if p == nil {
		return
	}
	p.field = field
}

func (p *Field) IsEmpty() bool {
	return p == nil || p.Value().IsEmpty()
}

func (p *Field) MigrateSchema(ctx context.Context, newSchema *Schema) bool {
	if p == nil || newSchema == nil {
		return false
	}

	fid := p.Field()
	schemaField := newSchema.Groups().Field(fid)

	// If field is not found in new schema, this field should be removed
	invalid := schemaField == nil

	// if value is not compatible for type, value will be cleared
	if !schemaField.Validate(p.v) {
		p.UpdateUnsafe(nil)
	}

	return !invalid
}

func (f *Field) GuessSchema() *SchemaField {
	if f == nil {
		return nil
	}
	if f, err := NewSchemaField().ID(f.Field()).Type(f.Type()).Build(); err == nil {
		return f
	}
	return nil
}
