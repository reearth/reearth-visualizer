package dataset

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

// Builder _
type Builder struct {
	d *Dataset
}

// New _
func New() *Builder {
	return &Builder{d: &Dataset{}}
}

// Build _
func (b *Builder) Build() (*Dataset, error) {
	if id.ID(b.d.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.d.fields == nil || b.d.order == nil {
		b.d.fields = map[id.DatasetSchemaFieldID]*Field{}
		b.d.order = []id.DatasetSchemaFieldID{}
	}
	return b.d, nil
}

// MustBuild _
func (b *Builder) MustBuild() *Dataset {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

// ID _
func (b *Builder) ID(id id.DatasetID) *Builder {
	b.d.id = id
	return b
}

// NewID _
func (b *Builder) NewID() *Builder {
	b.d.id = id.DatasetID(id.New())
	return b
}

// Scene _
func (b *Builder) Scene(scene id.SceneID) *Builder {
	b.d.scene = scene
	return b
}

// Source _
func (b *Builder) Source(source Source) *Builder {
	b.d.source = source
	return b
}

// Schema _
func (b *Builder) Schema(schema id.DatasetSchemaID) *Builder {
	b.d.schema = schema
	return b
}

// Fields _
func (b *Builder) Fields(fields []*Field) *Builder {
	b.d.fields = map[id.DatasetSchemaFieldID]*Field{}
	b.d.order = make([]id.DatasetSchemaFieldID, 0, len(fields))
	sources := map[Source]struct{}{}
	for _, f := range b.d.fields {
		if source := f.Source(); source != "" {
			sources[source] = struct{}{}
		}
	}
	for _, f := range fields {
		source := f.Source()
		if source == "" {
			b.d.fields[f.Field()] = f
			b.d.order = append(b.d.order, f.Field())
		} else if _, ok := sources[source]; !ok {
			b.d.fields[f.Field()] = f
			b.d.order = append(b.d.order, f.Field())
			sources[source] = struct{}{}
		}
	}
	return b
}
