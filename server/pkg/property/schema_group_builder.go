package property

import (
	"github.com/reearth/reearth/server/pkg/i18n"
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
	if b.p.id == "" {
		return nil, ErrInvalidID
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

func (b *SchemaGroupBuilder) ID(id SchemaGroupID) *SchemaGroupBuilder {
	b.p.id = id
	return b
}

func (b *SchemaGroupBuilder) Fields(fields []*SchemaField) *SchemaGroupBuilder {
	if len(fields) == 0 {
		b.p.fields = nil
		return b
	}

	newFields := []*SchemaField{}
	ids := map[FieldID]struct{}{}
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
	b.p.title = title.Clone()
	return b
}

func (b *SchemaGroupBuilder) Collection(collection i18n.String) *SchemaGroupBuilder {
	b.p.collection = collection.Clone()
	return b
}

func (b *SchemaGroupBuilder) RepresentativeField(representativeField *FieldID) *SchemaGroupBuilder {
	b.p.representativeField = representativeField.CloneRef()
	return b
}
