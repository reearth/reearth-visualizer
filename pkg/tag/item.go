package tag

import "github.com/reearth/reearth-backend/pkg/id"

type Item struct {
	tag
	parent                *id.TagID
	linkedDatasetFieldID  *id.DatasetSchemaFieldID
	linkedDatasetID       *id.DatasetID
	linkedDatasetSchemaID *id.DatasetSchemaID
}

func (i *Item) Parent() *id.TagID {
	return i.parent.CopyRef()
}

func (i *Item) LinkedDatasetFieldID() *id.DatasetSchemaFieldID {
	return i.linkedDatasetFieldID.CopyRef()
}

func (i *Item) LinkedDatasetID() *id.DatasetID {
	return i.linkedDatasetID.CopyRef()
}

func (i *Item) LinkedDatasetSchemaID() *id.DatasetSchemaID {
	return i.linkedDatasetSchemaID.CopyRef()
}

func (i *Item) SetParent(p *id.TagID) {
	if i == nil {
		return
	}
	i.parent = p.CopyRef()
}
