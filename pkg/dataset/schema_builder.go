package dataset

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

type SchemaBuilder struct {
	d *Schema
}

func NewSchema() *SchemaBuilder {
	return &SchemaBuilder{d: &Schema{}}
}

func (b *SchemaBuilder) Build() (*Schema, error) {
	if id.ID(b.d.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.d.fields == nil || b.d.order == nil {
		b.d.fields = map[id.DatasetSchemaFieldID]*SchemaField{}
		b.d.order = []id.DatasetSchemaFieldID{}
	}
	return b.d, nil
}

func (b *SchemaBuilder) MustBuild() *Schema {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *SchemaBuilder) ID(id id.DatasetSchemaID) *SchemaBuilder {
	b.d.id = id
	return b
}

func (b *SchemaBuilder) NewID() *SchemaBuilder {
	b.d.id = id.DatasetSchemaID(id.New())
	return b
}

func (b *SchemaBuilder) Scene(scene id.SceneID) *SchemaBuilder {
	b.d.scene = scene
	return b
}

func (b *SchemaBuilder) Name(name string) *SchemaBuilder {
	b.d.name = name
	return b
}

func (b *SchemaBuilder) Dynamic(dynamic bool) *SchemaBuilder {
	b.d.dynamic = dynamic
	return b
}

func (b *SchemaBuilder) Source(source string) *SchemaBuilder {
	b.d.source = source
	return b
}

func (b *SchemaBuilder) RepresentativeField(representativeField id.DatasetSchemaFieldID) *SchemaBuilder {
	rf := representativeField
	b.d.representativeField = &rf
	return b
}

func (b *SchemaBuilder) Fields(fields []*SchemaField) *SchemaBuilder {
	b.d.fields = map[id.DatasetSchemaFieldID]*SchemaField{}
	b.d.order = make([]id.DatasetSchemaFieldID, 0, len(fields))
	sources := map[string]struct{}{}

	for _, f := range fields {
		if f == nil {
			continue
		}

		if source := f.Source(); source == "" {
			copied := *f
			b.d.fields[f.ID()] = &copied
			b.d.order = append(b.d.order, f.ID())
		} else if _, ok := sources[source]; !ok {
			copied := *f
			b.d.fields[f.ID()] = &copied
			b.d.order = append(b.d.order, f.ID())
			sources[source] = struct{}{}
		}
	}

	return b
}
