package id

// PluginExtensionID _
type PluginExtensionID string

// PluginExtensionIDFromRef _
func PluginExtensionIDFromRef(id *string) *PluginExtensionID {
	if id == nil {
		return nil
	}
	id2 := PluginExtensionID(*id)
	return &id2
}

// Ref _
func (id PluginExtensionID) Ref() *PluginExtensionID {
	return &id
}

// CopyRef _
func (id *PluginExtensionID) CopyRef() *PluginExtensionID {
	if id == nil {
		return nil
	}
	id2 := *id
	return &id2
}

// String _
func (id PluginExtensionID) String() string {
	return string(id)
}

// StringRef _
func (id *PluginExtensionID) StringRef() *string {
	if id == nil {
		return nil
	}
	id2 := string(*id)
	return &id2
}
