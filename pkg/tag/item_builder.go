package tag

import "github.com/reearth/reearth-backend/pkg/id"

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
	if id.ID(b.i.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	if id.ID(b.i.sceneId).IsNil() {
		return nil, ErrInvalidSceneID
	}
	if b.i.label == "" {
		return nil, ErrEmptyLabel
	}
	return b.i, nil
}

func (b *ItemBuilder) ID(tid id.TagID) *ItemBuilder {
	b.i.id = tid
	return b
}

func (b *ItemBuilder) NewID() *ItemBuilder {
	b.i.id = id.NewTagID()
	return b
}

func (b *ItemBuilder) Label(l string) *ItemBuilder {
	b.i.label = l
	return b
}

func (b *ItemBuilder) Scene(sid id.SceneID) *ItemBuilder {
	b.i.sceneId = sid
	return b
}

func (b *ItemBuilder) Parent(p *id.TagID) *ItemBuilder {
	b.i.parent = p.CopyRef()
	return b
}

func (b *ItemBuilder) LinkedDatasetFieldID(dfid *id.DatasetSchemaFieldID) *ItemBuilder {
	b.i.linkedDatasetFieldID = dfid
	return b
}

func (b *ItemBuilder) LinkedDatasetID(did *id.DatasetID) *ItemBuilder {
	b.i.linkedDatasetID = did
	return b
}

func (b *ItemBuilder) LinkedDatasetSchemaID(dsid *id.DatasetSchemaID) *ItemBuilder {
	b.i.linkedDatasetSchemaID = dsid
	return b
}
