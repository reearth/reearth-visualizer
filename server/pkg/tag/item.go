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
	return i.parent.CloneRef()
}

func (i *Item) LinkedDatasetFieldID() *DatasetFieldID {
	if i == nil {
		return nil
	}
	return i.linkedDatasetFieldID.CloneRef()
}

func (i *Item) LinkedDatasetID() *DatasetID {
	if i == nil {
		return nil
	}
	return i.linkedDatasetID.CloneRef()
}

func (i *Item) LinkedDatasetSchemaID() *DatasetSchemaID {
	if i == nil {
		return nil
	}
	return i.linkedDatasetSchemaID.CloneRef()
}

func (i *Item) SetParent(p *ID) {
	if i == nil {
		return
	}
	i.parent = p.CloneRef()
}
