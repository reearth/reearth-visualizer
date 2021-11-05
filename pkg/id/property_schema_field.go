package id

type PropertySchemaFieldID string

func PropertySchemaFieldIDFrom(str *string) *PropertySchemaFieldID {
	if str == nil {
		return nil
	}
	id := PropertySchemaFieldID(*str)
	return &id
}

func (id PropertySchemaFieldID) Ref() *PropertySchemaFieldID {
	id2 := id
	return &id2
}

func (id *PropertySchemaFieldID) CopyRef() *PropertySchemaFieldID {
	if id == nil {
		return nil
	}
	id2 := *id
	return &id2
}

func (id PropertySchemaFieldID) String() string {
	return string(id)
}

func (id *PropertySchemaFieldID) StringRef() *string {
	if id == nil {
		return nil
	}
	str := string(*id)
	return &str
}
