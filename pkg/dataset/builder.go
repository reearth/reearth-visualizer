package dataset

type Builder struct {
	d *Dataset
}

func New() *Builder {
	return &Builder{d: &Dataset{}}
}

func (b *Builder) Build() (*Dataset, error) {
	if b.d.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.d.fields == nil || b.d.order == nil {
		b.d.fields = map[FieldID]*Field{}
		b.d.order = []FieldID{}
	}
	return b.d, nil
}

func (b *Builder) MustBuild() *Dataset {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.d.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.d.id = NewID()
	return b
}

func (b *Builder) Scene(scene SceneID) *Builder {
	b.d.scene = scene
	return b
}

func (b *Builder) Source(source string) *Builder {
	b.d.source = source
	return b
}

func (b *Builder) Schema(schema SchemaID) *Builder {
	b.d.schema = schema
	return b
}

func (b *Builder) Fields(fields []*Field) *Builder {
	b.d.fields = map[FieldID]*Field{}
	b.d.order = make([]FieldID, 0, len(fields))

	sources := map[string]struct{}{}
	for _, f := range b.d.fields {
		if source := f.Source(); source != "" {
			sources[source] = struct{}{}
		}
	}

	for _, f := range fields {
		if f.IsEmpty() {
			continue
		}
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
