package property

import (
	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
)

type SchemaGroupBuilder struct {
	p *SchemaGroup
}

func NewSchemaGroup() *SchemaGroupBuilder {
	return &SchemaGroupBuilder{
		p: &SchemaGroup{},
	}
}

func (b *SchemaGroupBuilder) Build() (*SchemaGroup, error) {
	if b.p.sid.IsNil() {
		return nil, id.ErrInvalidID
	}
	return b.p, nil
}

func (b *SchemaGroupBuilder) MustBuild() *SchemaGroup {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *SchemaGroupBuilder) ID(id id.PropertySchemaFieldID) *SchemaGroupBuilder {
	b.p.id = id
	return b
}

func (b *SchemaGroupBuilder) Schema(sid id.PropertySchemaID) *SchemaGroupBuilder {
	b.p.sid = sid
	return b
}

func (b *SchemaGroupBuilder) Fields(fields []*SchemaField) *SchemaGroupBuilder {
	newFields := []*SchemaField{}
	ids := map[id.PropertySchemaFieldID]struct{}{}
	for _, f := range fields {
		if f == nil {
			continue
		}
		if _, ok := ids[f.ID()]; ok {
			continue
		}
		ids[f.ID()] = struct{}{}
		newFields = append(newFields, f)
	}
	b.p.fields = newFields
	return b
}

func (b *SchemaGroupBuilder) IsList(list bool) *SchemaGroupBuilder {
	b.p.list = list
	return b
}

func (b *SchemaGroupBuilder) IsAvailableIf(cond *Condition) *SchemaGroupBuilder {
	b.p.isAvailableIf = cond.Clone()
	return b
}

func (b *SchemaGroupBuilder) Title(title i18n.String) *SchemaGroupBuilder {
	b.p.title = title.Copy()
	return b
}

func (b *SchemaGroupBuilder) RepresentativeField(representativeField *id.PropertySchemaFieldID) *SchemaGroupBuilder {
	if representativeField == nil {
		b.p.representativeField = nil
		return b
	}
	representativeField2 := *representativeField
	b.p.representativeField = &representativeField2
	return b
}
