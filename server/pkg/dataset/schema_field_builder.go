package dataset

import (
	"errors"
)

type SchemaFieldBuilder struct {
	d *SchemaField
}

func NewSchemaField() *SchemaFieldBuilder {
	return &SchemaFieldBuilder{d: &SchemaField{}}
}

func (b *SchemaFieldBuilder) Build() (*SchemaField, error) {
	if b.d.id.IsNil() {
		return nil, ErrInvalidID
	}
	if !b.d.dataType.Default() {
		return nil, errors.New("invalid value type")
	}
	return b.d, nil
}

func (b *SchemaFieldBuilder) MustBuild() *SchemaField {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *SchemaFieldBuilder) ID(id FieldID) *SchemaFieldBuilder {
	b.d.id = id
	return b
}

func (b *SchemaFieldBuilder) NewID() *SchemaFieldBuilder {
	b.d.id = NewFieldID()
	return b
}

func (b *SchemaFieldBuilder) Name(name string) *SchemaFieldBuilder {
	b.d.name = name
	return b
}

func (b *SchemaFieldBuilder) Type(dataType ValueType) *SchemaFieldBuilder {
	b.d.dataType = dataType
	return b
}

func (b *SchemaFieldBuilder) Source(source string) *SchemaFieldBuilder {
	b.d.source = source
	return b
}

func (b *SchemaFieldBuilder) Ref(ref *SchemaID) *SchemaFieldBuilder {
	b.d.ref = ref.CloneRef()
	return b
}
