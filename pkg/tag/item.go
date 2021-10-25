package tag

import "github.com/reearth/reearth-backend/pkg/id"

type Item struct {
	tag
	linkedDatasetFieldID  *id.DatasetSchemaFieldID
	linkedDatasetID       *id.DatasetID
	linkedDatasetSchemaID *id.DatasetSchemaID
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
