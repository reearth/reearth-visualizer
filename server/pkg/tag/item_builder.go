package tag

type ItemBuilder struct {
	i *Item
}

func NewItem() *ItemBuilder {
	return &ItemBuilder{i: &Item{}}
}

func ItemFrom(t Tag) *Item {
	li, ok := t.(*Item)
	if !ok {
		return nil
	}
	return li
}

func (b *ItemBuilder) Build() (*Item, error) {
	if b.i.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.i.sceneId.IsNil() {
		return nil, ErrInvalidSceneID
	}
	if b.i.label == "" {
		return nil, ErrEmptyLabel
	}
	return b.i, nil
}

func (b *ItemBuilder) MustBuild() *Item {
	res, err := b.Build()
	if err != nil {
		panic(err)
	}
	return res
}

func (b *ItemBuilder) ID(tid ID) *ItemBuilder {
	b.i.id = tid
	return b
}

func (b *ItemBuilder) NewID() *ItemBuilder {
	b.i.id = NewID()
	return b
}

func (b *ItemBuilder) Label(l string) *ItemBuilder {
	b.i.label = l
	return b
}

func (b *ItemBuilder) Scene(sid SceneID) *ItemBuilder {
	b.i.sceneId = sid
	return b
}

func (b *ItemBuilder) Parent(p *ID) *ItemBuilder {
	b.i.parent = p.CloneRef()
	return b
}

func (b *ItemBuilder) LinkedDatasetFieldID(dfid *DatasetFieldID) *ItemBuilder {
	b.i.linkedDatasetFieldID = dfid
	return b
}

func (b *ItemBuilder) LinkedDatasetID(did *DatasetID) *ItemBuilder {
	b.i.linkedDatasetID = did
	return b
}

func (b *ItemBuilder) LinkedDatasetSchemaID(dsid *DatasetSchemaID) *ItemBuilder {
	b.i.linkedDatasetSchemaID = dsid
	return b
}
