package property

import "github.com/reearth/reearth-backend/pkg/id"

// FieldBuilder _
type FieldBuilder struct {
	p   *Field
	psf *SchemaField
}

// FieldUnsafeBuilder _
type FieldUnsafeBuilder struct {
	p *Field
}

// NewField _
func NewField(p *SchemaField) *FieldBuilder {
	b := &FieldBuilder{
		p: &Field{},
	}
	return b.schemaField(p)
}

// Build _
func (b *FieldBuilder) Build() (*Field, error) {
	if b.p.field == id.PropertySchemaFieldID("") {
		return nil, id.ErrInvalidID
	}
	if b.psf != nil && !b.psf.Validate(b.p.value) {
		return nil, ErrInvalidPropertyValue
	}
	return b.p, nil
}

// MustBuild _
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
		b.p.ptype = p.Type()
		if dv := p.DefaultValue(); dv != nil {
			dv2 := *dv
			b.p.value = &dv2
		}
	}
	return b
}

// Value _
func (b *FieldBuilder) Value(v *Value) *FieldBuilder {
	if b.p.field == id.PropertySchemaFieldID("") {
		return b
	}
	v2 := *v
	b.p.value = &v2
	return b
}

// Link _
func (b *FieldBuilder) Link(l *Links) *FieldBuilder {
	b.p.links = l.Clone()
	return b
}

// NewFieldUnsafe _
func NewFieldUnsafe() *FieldUnsafeBuilder {
	return &FieldUnsafeBuilder{
		p: &Field{},
	}
}

// Build _
func (b *FieldUnsafeBuilder) Build() *Field {
	return b.p
}

// FieldUnsafe _
func (b *FieldUnsafeBuilder) FieldUnsafe(f id.PropertySchemaFieldID) *FieldUnsafeBuilder {
	b.p.field = f
	return b
}

// TypeUnsafe _
func (b *FieldUnsafeBuilder) TypeUnsafe(t ValueType) *FieldUnsafeBuilder {
	b.p.ptype = t
	return b
}

// ValueUnsafe _
func (b *FieldUnsafeBuilder) ValueUnsafe(v *Value) *FieldUnsafeBuilder {
	if v == nil {
		b.p.value = nil
		return b
	}

	v2 := *v
	b.p.value = &v2
	b.p.ptype = v.Type()
	return b
}

// LinksUnsafe _
func (b *FieldUnsafeBuilder) LinksUnsafe(l *Links) *FieldUnsafeBuilder {
	b.p.links = l.Clone()
	return b
}
