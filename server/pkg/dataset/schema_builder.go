package dataset

type SchemaBuilder struct {
	d *Schema
}

func NewSchema() *SchemaBuilder {
	return &SchemaBuilder{d: &Schema{}}
}

func (b *SchemaBuilder) Build() (*Schema, error) {
	if b.d.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.d.fields == nil || b.d.order == nil {
		b.d.fields = map[FieldID]*SchemaField{}
		b.d.order = []FieldID{}
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

func (b *SchemaBuilder) ID(id SchemaID) *SchemaBuilder {
	b.d.id = id
	return b
}

func (b *SchemaBuilder) NewID() *SchemaBuilder {
	b.d.id = NewSchemaID()
	return b
}

func (b *SchemaBuilder) Scene(scene SceneID) *SchemaBuilder {
	b.d.scene = scene
	return b
}

func (b *SchemaBuilder) Name(name string) *SchemaBuilder {
	b.d.name = name
	return b
}

func (b *SchemaBuilder) Source(source string) *SchemaBuilder {
	b.d.source = source
	return b
}

func (b *SchemaBuilder) RepresentativeField(representativeField FieldID) *SchemaBuilder {
	rf := representativeField
	b.d.representativeField = &rf
	return b
}

func (b *SchemaBuilder) Fields(fields []*SchemaField) *SchemaBuilder {
	b.d.fields = map[FieldID]*SchemaField{}
	b.d.order = make([]FieldID, 0, len(fields))
	sources := map[string]struct{}{}

	for _, f := range fields {
		if f == nil {
			continue
		}

		if source := f.Source(); source == "" {
			b.d.fields[f.ID()] = f.Clone()
			b.d.order = append(b.d.order, f.ID())
		} else if _, ok := sources[source]; !ok {
			b.d.fields[f.ID()] = f.Clone()
			b.d.order = append(b.d.order, f.ID())
			sources[source] = struct{}{}
		}
	}

	return b
}
