package tag

type Item struct {
	tag
	parent                *ID
	linkedDatasetFieldID  *DatasetFieldID
	linkedDatasetID       *DatasetID
	linkedDatasetSchemaID *DatasetSchemaID
}

func (i *Item) Parent() *ID {
	if i == nil {
		return nil
	}
	return i.parent.CopyRef()
}

func (i *Item) LinkedDatasetFieldID() *DatasetFieldID {
	if i == nil {
		return nil
	}
	return i.linkedDatasetFieldID.CopyRef()
}

func (i *Item) LinkedDatasetID() *DatasetID {
	if i == nil {
		return nil
	}
	return i.linkedDatasetID.CopyRef()
}

func (i *Item) LinkedDatasetSchemaID() *DatasetSchemaID {
	if i == nil {
		return nil
	}
	return i.linkedDatasetSchemaID.CopyRef()
}

func (i *Item) SetParent(p *ID) {
	if i == nil {
		return
	}
	i.parent = p.CopyRef()
}
