package property

type Builder struct {
	p *Property
}

func New() *Builder {
	return &Builder{p: &Property{}}
}

func (b *Builder) Build() (*Property, error) {
	if b.p.IDField.IsNil() {
		return nil, ErrInvalidID
	}
	if b.p.SceneField.IsNil() {
		return nil, ErrInvalidSceneID
	}
	if b.p.SchemaField.IsNil() {
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
	b.p.IDField = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.p.IDField = NewID()
	return b
}

func (b *Builder) Scene(s SceneID) *Builder {
	b.p.SceneField = s
	return b
}

func (b *Builder) Schema(schema SchemaID) *Builder {
	b.p.SchemaField = schema
	return b
}

func (b *Builder) Items(items []Item) *Builder {
	if len(items) == 0 {
		b.p.ItemsField = nil
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

	b.p.ItemsField = newItems
	return b
}
