package id

type PropertySchemaIDList []PropertySchemaID

// Clone duplicates the PropertySchemaIDList
func (l PropertySchemaIDList) Clone() PropertySchemaIDList {
	if l == nil {
		return nil
	}
	l2 := make(PropertySchemaIDList, len(l))
	for i, id := range l {
		l2[i] = id.Clone()
	}
	return l2
}

// Merge merges PropertySchemaIDList
func (l PropertySchemaIDList) Merge(l2 PropertySchemaIDList) PropertySchemaIDList {
	if l == nil {
		return l2.Clone()
	}
	l3 := l.Clone()
	if l2 == nil {
		return l3
	}
	l3 = append(l3, l2...)
	return l3
}

// MergeUnique merges PropertySchemaIDList
func (l PropertySchemaIDList) MergeUnique(l2 PropertySchemaIDList) PropertySchemaIDList {
	if l == nil {
		return l2.Clone()
	}
	l3 := l.Clone()
	if l2 == nil {
		return l3
	}
	for _, id := range l2 {
		if !l3.Contains(id) {
			l3 = append(l3, id)
		}
	}
	return l3
}

// Contains checks if PropertySchemaIDList contains PropertySchemaID
func (l PropertySchemaIDList) Contains(id PropertySchemaID) bool {
	if l == nil {
		return false
	}
	for _, id2 := range l {
		if id2 == id {
			return true
		}
	}
	return false
}
