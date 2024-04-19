package property

import "fmt"

type FieldBuilder struct {
	p *Field
}

func NewField(field FieldID) *FieldBuilder {
	return &FieldBuilder{
		p: &Field{
			FieldField: field,
		},
	}
}

func FieldFrom(sf *SchemaField) *FieldBuilder {
	if sf == nil {
		return NewField("")
	}
	return &FieldBuilder{
		p: &Field{
			FieldField: sf.ID(),
			ValueField: NewOptionalValue(sf.Type(), nil),
		},
	}
}

func (b *FieldBuilder) Build() *Field {
	if b.p.FieldField == "" || b.p.ValueField == nil {
		return nil
	}
	return b.p
}

func (b *FieldBuilder) MustBuild() *Field {
	f := b.Build()
	if f == nil {
		panic(fmt.Sprintf("field ID or type is invalid: id=%s, type=%s", b.p.FieldField, b.p.ValueField.Type()))
	}
	return f
}

func (b *FieldBuilder) Field(field FieldID) *FieldBuilder {
	b.p.FieldField = field
	return b
}

func (b *FieldBuilder) Value(v *OptionalValue) *FieldBuilder {
	b.p.ValueField = v.Clone()
	return b
}

func (b *FieldBuilder) Type(t ValueType) *FieldBuilder {
	if b.p.ValueField.Type() != t {
		b.p.ValueField = NewOptionalValue(t, nil)
	}
	return b
}

func (b *FieldBuilder) Links(l *Links) *FieldBuilder {
	b.p.LinksField = l.Clone()
	return b
}
