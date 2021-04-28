package dataset

import (
	"errors"

	"github.com/reearth/reearth-backend/pkg/id"
)

// SchemaFieldBuilder _
type SchemaFieldBuilder struct {
	d *SchemaField
}

// NewSchemaField _
func NewSchemaField() *SchemaFieldBuilder {
	return &SchemaFieldBuilder{d: &SchemaField{}}
}

// Build _
func (b *SchemaFieldBuilder) Build() (*SchemaField, error) {
	if id.ID(b.d.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	if _, ok := b.d.dataType.Validate(); !ok {
		return nil, errors.New("invalid value type")
	}
	return b.d, nil
}

// MustBuild _
func (b *SchemaFieldBuilder) MustBuild() *SchemaField {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

// ID _
func (b *SchemaFieldBuilder) ID(id id.DatasetSchemaFieldID) *SchemaFieldBuilder {
	b.d.id = id
	return b
}

// NewID _
func (b *SchemaFieldBuilder) NewID() *SchemaFieldBuilder {
	b.d.id = id.DatasetSchemaFieldID(id.New())
	return b
}

// Name _
func (b *SchemaFieldBuilder) Name(name string) *SchemaFieldBuilder {
	b.d.name = name
	return b
}

// Type _
func (b *SchemaFieldBuilder) Type(dataType ValueType) *SchemaFieldBuilder {
	b.d.dataType = dataType
	return b
}

// Source _
func (b *SchemaFieldBuilder) Source(source Source) *SchemaFieldBuilder {
	b.d.source = source
	return b
}

// Ref _
func (b *SchemaFieldBuilder) Ref(ref *id.DatasetSchemaID) *SchemaFieldBuilder {
	if ref == nil {
		b.d.ref = nil
	} else {
		ref2 := *ref
		b.d.ref = &ref2
	}
	return b
}
