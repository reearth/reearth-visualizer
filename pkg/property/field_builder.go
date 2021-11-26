package property

import "github.com/reearth/reearth-backend/pkg/id"

type FieldBuilder struct {
	p   *Field
	psf *SchemaField
}

type FieldUnsafeBuilder struct {
	p *Field
}

func NewField(p *SchemaField) *FieldBuilder {
	b := &FieldBuilder{
		p: &Field{},
	}
	return b.schemaField(p)
}

func (b *FieldBuilder) Build() (*Field, error) {
	if b.p.field == id.PropertySchemaFieldID("") {
		return nil, id.ErrInvalidID
	}
	if b.psf != nil && !b.psf.Validate(b.p.v) {
		return nil, ErrInvalidPropertyValue
	}
	return b.p, nil
}

func (b *FieldBuilder) MustBuild() *Field {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *FieldBuilder) schemaField(p *SchemaField) *FieldBuilder {
	if p != nil {
		b.psf = p
		b.p.field = p.ID()
		b.p.v = NewOptionalValue(p.Type(), p.DefaultValue().Clone())
	}
	return b
}

func (b *FieldBuilder) Value(v *OptionalValue) *FieldBuilder {
	b.p.v = v.Clone()
	return b
}

func (b *FieldBuilder) Link(l *Links) *FieldBuilder {
	b.p.links = l.Clone()
	return b
}

func NewFieldUnsafe() *FieldUnsafeBuilder {
	return &FieldUnsafeBuilder{
		p: &Field{},
	}
}

func (b *FieldUnsafeBuilder) Build() *Field {
	return b.p
}

func (b *FieldUnsafeBuilder) FieldUnsafe(f id.PropertySchemaFieldID) *FieldUnsafeBuilder {
	b.p.field = f
	return b
}

func (b *FieldUnsafeBuilder) ValueUnsafe(v *OptionalValue) *FieldUnsafeBuilder {
	b.p.v = v.Clone()
	return b
}

func (b *FieldUnsafeBuilder) LinksUnsafe(l *Links) *FieldUnsafeBuilder {
	b.p.links = l.Clone()
	return b
}
