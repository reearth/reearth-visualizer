package id

// PropertySchemaFieldID _
type PropertySchemaFieldID string

// PropertySchemaFieldIDFrom _
func PropertySchemaFieldIDFrom(str *string) *PropertySchemaFieldID {
	if str == nil {
		return nil
	}
	id := PropertySchemaFieldID(*str)
	return &id
}

// Ref _
func (id PropertySchemaFieldID) Ref() *PropertySchemaFieldID {
	id2 := id
	return &id2
}

// CopyRef _
func (id *PropertySchemaFieldID) CopyRef() *PropertySchemaFieldID {
	if id == nil {
		return nil
	}
	id2 := *id
	return &id2
}

// String _
func (id PropertySchemaFieldID) String() string {
	return string(id)
}

// StringRef _
func (id *PropertySchemaFieldID) StringRef() *string {
	if id == nil {
		return nil
	}
	str := string(*id)
	return &str
}
