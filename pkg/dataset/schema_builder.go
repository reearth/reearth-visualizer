package dataset

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

// SchemaBuilder _
type SchemaBuilder struct {
	d *Schema
}

// NewSchema _
func NewSchema() *SchemaBuilder {
	return &SchemaBuilder{d: &Schema{}}
}

// Build _
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

// MustBuild _
func (b *SchemaBuilder) MustBuild() *Schema {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

// ID _
func (b *SchemaBuilder) ID(id id.DatasetSchemaID) *SchemaBuilder {
	b.d.id = id
	return b
}

// NewID _
func (b *SchemaBuilder) NewID() *SchemaBuilder {
	b.d.id = id.DatasetSchemaID(id.New())
	return b
}

// Scene _
func (b *SchemaBuilder) Scene(scene id.SceneID) *SchemaBuilder {
	b.d.scene = scene
	return b
}

// Name _
func (b *SchemaBuilder) Name(name string) *SchemaBuilder {
	b.d.name = name
	return b
}

// Dynamic _
func (b *SchemaBuilder) Dynamic(dynamic bool) *SchemaBuilder {
	b.d.dynamic = dynamic
	return b
}

// Source _
func (b *SchemaBuilder) Source(source Source) *SchemaBuilder {
	b.d.source = source
	return b
}

// RepresentativeField _
func (b *SchemaBuilder) RepresentativeField(representativeField id.DatasetSchemaFieldID) *SchemaBuilder {
	rf := representativeField
	b.d.representativeField = &rf
	return b
}

// Fields _
func (b *SchemaBuilder) Fields(fields []*SchemaField) *SchemaBuilder {
	b.d.fields = map[id.DatasetSchemaFieldID]*SchemaField{}
	b.d.order = []id.DatasetSchemaFieldID{}
	sources := map[string]struct{}{}
	for _, f := range b.d.fields {
		if f == nil {
			continue
		}
		source := f.Source().String()
		if source != "" {
			sources[source] = struct{}{}
		}
	}
	for _, f := range fields {
		if f == nil {
			continue
		}
		source := f.Source().String()
		if source == "" {
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
