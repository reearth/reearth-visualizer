package property

type Sealed struct {
	Original      *ID
	Parent        *ID
	Schema        SchemaID
	LinkedDataset *DatasetID
	Items         []*SealedItem
}

type SealedItem struct {
	Original      *ItemID
	Parent        *ItemID
	SchemaGroup   SchemaGroupID
	LinkedDataset *DatasetID
	Fields        []*SealedField
	Groups        []*SealedItem
}

type SealedField struct {
	ID  FieldID
	Val *ValueAndDatasetValue
}

func (f *SealedField) Value() *Value {
	if f == nil {
		return nil
	}
	return f.Val.Value()
}

func (s *Sealed) Interface() map[string]interface{} {
	if s == nil {
		return nil
	}

	res := map[string]interface{}{}
	for _, item := range s.Items {
		i := item.Interface()
		if i != nil {
			res[item.SchemaGroup.String()] = i
		}
	}

	return res
}

func (s *SealedItem) Interface() interface{} {
	if s == nil {
		return nil
	}

	if len(s.Groups) > 0 {
		items := make([]map[string]interface{}, 0, len(s.Groups))
		for _, g := range s.Groups {
			i := sealedFieldsInterface(g.Fields)
			if g.Original != nil {
				i["id"] = g.Original.String()
			}
			items = append(items, i)
		}
		return items
	}

	return sealedFieldsInterface(s.Fields)
}

func sealedFieldsInterface(fields []*SealedField) map[string]interface{} {
	item := map[string]interface{}{}

	for _, f := range fields {
		item[f.ID.String()] = f.Val.Value().Interface()
	}

	return item
}

func (s *Sealed) Item(i ItemID) *SealedItem {
	if s == nil {
		return nil
	}
	for _, item := range s.Items {
		if item.Match(i) {
			return item
		}
		if g := item.Group(i); g != nil {
			return g
		}
	}
	return nil
}

func (s *Sealed) ItemBy(ptr *Pointer) *SealedItem {
	if s == nil || ptr == nil {
		return nil
	}
	if sg, ok := ptr.ItemBySchemaGroup(); ok {
		return s.ItemBySchemaGroup(sg)
	}
	if i, ok := ptr.Item(); ok {
		return s.Item(i)
	}
	return nil
}

func (s *Sealed) ItemBySchemaGroup(i SchemaGroupID) *SealedItem {
	if s == nil {
		return nil
	}
	for _, item := range s.Items {
		if item.SchemaGroup == i {
			return item
		}
	}
	return nil
}

func (s *Sealed) Field(id FieldID) *SealedField {
	if s == nil {
		return nil
	}
	for _, i := range s.Items {
		if f := i.Field(id); f != nil {
			return f
		}
	}
	return nil
}

func (s *Sealed) FieldBy(ptr *Pointer) *SealedField {
	if s == nil || ptr == nil {
		return nil
	}
	if sg, f, ok := ptr.FieldBySchemaGroup(); ok {
		return s.ItemBySchemaGroup(sg).Field(f)
	}
	if i, f, ok := ptr.FieldByItem(); ok {
		return s.Item(i).Field(f)
	}
	if f, ok := ptr.Field(); ok {
		return s.Field(f)
	}
	return nil
}

func (s *SealedItem) Match(id ItemID) bool {
	if s == nil {
		return false
	}
	return s.Original != nil && *s.Original == id || s.Parent != nil && *s.Parent == id
}

func (s *SealedItem) Group(id ItemID) *SealedItem {
	if s == nil {
		return nil
	}
	for _, g := range s.Groups {
		if g.Match(id) {
			return g
		}
	}
	return nil
}

func (s *SealedItem) Field(id FieldID) *SealedField {
	if s == nil {
		return nil
	}
	for _, f := range s.Fields {
		if f.ID == id {
			return f
		}
	}
	return nil
}
