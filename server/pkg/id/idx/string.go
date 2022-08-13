package idx

type StringID[T Type] string

func StringIDFromRef[T Type](id *string) *StringID[T] {
	if id == nil {
		return nil
	}
	id2 := StringID[T](*id)
	return &id2
}

func (id StringID[T]) Ref() *StringID[T] {
	if id == "" {
		return nil
	}
	return &id
}

func (id *StringID[T]) CloneRef() *StringID[T] {
	if id == nil {
		return nil
	}
	id2 := *id
	return &id2
}

func (id StringID[_]) String() string {
	return string(id)
}

func (id *StringID[_]) StringRef() *string {
	if id == nil {
		return nil
	}
	id2 := string(*id)
	return &id2
}
