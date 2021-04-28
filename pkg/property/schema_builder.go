package property

import (
	"errors"
	"fmt"

	"github.com/reearth/reearth-backend/pkg/id"
)

var (
	ErrInvalidSceneID               error = errors.New("invalid scene id")
	ErrInvalidPropertySchemaID      error = errors.New("invalid property schema id")
	ErrInvalidValue                 error = errors.New("invalid value")
	ErrInvalidPropertyLinkableField error = errors.New("invalid property linkable field")
	ErrInvalidVersion               error = errors.New("invalid version")
	ErrDuplicatedField                    = errors.New("duplicated field")
)

type SchemaBuilder struct {
	p *Schema
}

func NewSchema() *SchemaBuilder {
	return &SchemaBuilder{p: &Schema{}}
}

func (b *SchemaBuilder) Build() (*Schema, error) {
	if b.p.id.IsNil() {
		return nil, id.ErrInvalidID
	}
	if d := b.p.DetectDuplicatedFields(); len(d) > 0 {
		return nil, fmt.Errorf("%s: %s %s", ErrDuplicatedField, b.p.id, d)
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

func (b *SchemaBuilder) ID(id id.PropertySchemaID) *SchemaBuilder {
	b.p.id = id
	return b
}

func (b *SchemaBuilder) Version(version int) *SchemaBuilder {
	b.p.version = version
	return b
}

func (b *SchemaBuilder) Groups(groups []*SchemaGroup) *SchemaBuilder {
	newGroups := []*SchemaGroup{}
	ids := map[id.PropertySchemaFieldID]struct{}{}
	for _, f := range groups {
		if f == nil {
			continue
		}
		if _, ok := ids[f.ID()]; ok {
			continue
		}
		ids[f.ID()] = struct{}{}
		newGroups = append(newGroups, f)
	}
	b.p.groups = newGroups
	return b
}

func (b *SchemaBuilder) LinkableFields(l LinkableFields) *SchemaBuilder {
	b.p.linkable = l
	return b
}
