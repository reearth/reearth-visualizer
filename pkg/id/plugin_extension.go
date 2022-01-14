package id

type PluginExtensionID string

func PluginExtensionIDFromRef(id *string) *PluginExtensionID {
	if id == nil {
		return nil
	}
	id2 := PluginExtensionID(*id)
	return &id2
}

func (id PluginExtensionID) Ref() *PluginExtensionID {
	return &id
}

func (id *PluginExtensionID) CopyRef() *PluginExtensionID {
	if id == nil {
		return nil
	}
	id2 := *id
	return &id2
}

func (id PluginExtensionID) String() string {
	return string(id)
}

func (id *PluginExtensionID) StringRef() *string {
	if id == nil {
		return nil
	}
	id2 := string(*id)
	return &id2
}
