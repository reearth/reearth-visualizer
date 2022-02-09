package property

import (
	"errors"
)

var (
	ErrInvalidSceneID               = errors.New("invalid scene id")
	ErrInvalidPropertySchemaID      = errors.New("invalid property schema id")
	ErrInvalidValue                 = errors.New("invalid value")
	ErrInvalidPropertyLinkableField = errors.New("invalid property linkable field")
	ErrInvalidVersion               = errors.New("invalid version")
)

type SchemaBuilder struct {
	p *Schema
}

func NewSchema() *SchemaBuilder {
	return &SchemaBuilder{p: &Schema{}}
}

func (b *SchemaBuilder) Build() (*Schema, error) {
	if b.p.id.IsNil() {
		return nil, ErrInvalidID
	}
	if !b.p.linkable.Validate(b.p) {
		return nil, ErrInvalidPropertyLinkableField
	}
	return b.p, nil
}

func (b *SchemaBuilder) MustBuild() *Schema {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *SchemaBuilder) ID(id SchemaID) *SchemaBuilder {
	b.p.id = id
	return b
}

func (b *SchemaBuilder) Version(version int) *SchemaBuilder {
	b.p.version = version
	return b
}

func (b *SchemaBuilder) Groups(groups *SchemaGroupList) *SchemaBuilder {
	b.p.groups = groups
	return b
}

func (b *SchemaBuilder) LinkableFields(l LinkableFields) *SchemaBuilder {
	b.p.linkable = l
	return b
}
