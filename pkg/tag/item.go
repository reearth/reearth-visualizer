package tag

type Item struct {
	tag
	parent                *ID
	linkedDatasetFieldID  *DatasetFieldID
	linkedDatasetID       *DatasetID
	linkedDatasetSchemaID *DatasetSchemaID
}

func (i *Item) Parent() *ID {
	return i.parent.CopyRef()
}

func (i *Item) LinkedDatasetFieldID() *DatasetFieldID {
	return i.linkedDatasetFieldID.CopyRef()
}

func (i *Item) LinkedDatasetID() *DatasetID {
	return i.linkedDatasetID.CopyRef()
}

func (i *Item) LinkedDatasetSchemaID() *DatasetSchemaID {
	return i.linkedDatasetSchemaID.CopyRef()
}

func (i *Item) SetParent(p *ID) {
	if i == nil {
		return
	}
	i.parent = p.CopyRef()
}
