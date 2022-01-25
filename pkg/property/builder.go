package property

type Builder struct {
	p *Property
}

func New() *Builder {
	return &Builder{p: &Property{}}
}

func (b *Builder) Build() (*Property, error) {
	if b.p.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.p.scene.IsNil() {
		return nil, ErrInvalidSceneID
	}
	if b.p.schema.IsNil() {
		return nil, ErrInvalidPropertySchemaID
	}
	return b.p, nil
}

func (b *Builder) MustBuild() *Property {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *Builder) ID(id ID) *Builder {
	b.p.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.p.id = NewID()
	return b
}

func (b *Builder) Scene(s SceneID) *Builder {
	b.p.scene = s
	return b
}

func (b *Builder) Schema(schema SchemaID) *Builder {
	b.p.schema = schema
	return b
}

func (b *Builder) Items(items []Item) *Builder {
	if len(items) == 0 {
		b.p.items = nil
		return b
	}

	newItems := make([]Item, 0, len(items))
	ids := map[ItemID]struct{}{}
	for _, f := range items {
		if f == nil {
			continue
		}
		if _, ok := ids[f.ID()]; ok {
			continue
		}
		ids[f.ID()] = struct{}{}
		newItems = append(newItems, f)
	}

	b.p.items = newItems
	return b
}
