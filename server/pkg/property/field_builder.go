package property

import "fmt"

type FieldBuilder struct {
	p *Field
}

func NewField(field FieldID) *FieldBuilder {
	return &FieldBuilder{
		p: &Field{
			field: field,
		},
	}
}

func FieldFrom(sf *SchemaField) *FieldBuilder {
	if sf == nil {
		return NewField("")
	}
	return &FieldBuilder{
		p: &Field{
			field: sf.ID(),
			v:     NewOptionalValue(sf.Type(), nil),
		},
	}
}

func (b *FieldBuilder) Build() *Field {
	if b.p.field == "" || b.p.v == nil {
		return nil
	}
	return b.p
}

func (b *FieldBuilder) MustBuild() *Field {
	f := b.Build()
	if f == nil {
		panic(fmt.Sprintf("field ID or type is invalid: id=%s, type=%s", b.p.field, b.p.v.Type()))
	}
	return f
}

func (b *FieldBuilder) Field(field FieldID) *FieldBuilder {
	b.p.field = field
	return b
}

func (b *FieldBuilder) Value(v *OptionalValue) *FieldBuilder {
	b.p.v = v.Clone()
	return b
}

func (b *FieldBuilder) Type(t ValueType) *FieldBuilder {
	if b.p.v.Type() != t {
		b.p.v = NewOptionalValue(t, nil)
	}
	return b
}

func (b *FieldBuilder) Links(l *Links) *FieldBuilder {
	b.p.links = l.Clone()
	return b
}
