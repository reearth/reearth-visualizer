package id

type PropertySchemaGroupID string

func PropertySchemaGroupIDFrom(str *string) *PropertySchemaGroupID {
	if str == nil || *str == "" {
		return nil
	}
	id := PropertySchemaGroupID(*str)
	return &id
}

func (id PropertySchemaGroupID) Ref() *PropertySchemaGroupID {
	if id == "" {
		return nil
	}
	id2 := id
	return &id2
}

func (id *PropertySchemaGroupID) CopyRef() *PropertySchemaGroupID {
	if id == nil || *id == "" {
		return nil
	}
	id2 := *id
	return &id2
}

func (id PropertySchemaGroupID) String() string {
	return string(id)
}

func (id *PropertySchemaGroupID) StringRef() *string {
	if id == nil || *id == "" {
		return nil
	}
	str := string(*id)
	return &str
}
