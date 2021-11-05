package id

type PropertySchemaGroupID string

func PropertySchemaGroupIDFrom(str *string) *PropertySchemaGroupID {
	if str == nil {
		return nil
	}
	id := PropertySchemaGroupID(*str)
	return &id
}

func (id PropertySchemaGroupID) Ref() *PropertySchemaGroupID {
	id2 := id
	return &id2
}

func (id *PropertySchemaGroupID) CopyRef() *PropertySchemaGroupID {
	if id == nil {
		return nil
	}
	id2 := *id
	return &id2
}

func (id PropertySchemaGroupID) String() string {
	return string(id)
}

func (id *PropertySchemaGroupID) StringRef() *string {
	if id == nil {
		return nil
	}
	str := string(*id)
	return &str
}
