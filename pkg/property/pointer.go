package property

// Pointer is a pointer to a field and an item in properties and schemas
type Pointer struct {
	schemaItem *SchemaGroupID
	item       *ItemID
	field      *FieldID
}

// NewPointer creates a new Pointer.
func NewPointer(sg *SchemaGroupID, i *ItemID, f *FieldID) *Pointer {
	if sg == nil && i == nil && f == nil {
		return nil
	}
	return &Pointer{
		schemaItem: sg.CopyRef(),
		item:       i.CopyRef(),
		field:      f.CopyRef(),
	}
}

// PointField creates a new Pointer pointing the field in properties.
func PointField(sg *SchemaGroupID, i *ItemID, f FieldID) *Pointer {
	return &Pointer{
		schemaItem: sg.CopyRef(),
		item:       i.CopyRef(),
		field:      &f,
	}
}

// PointField creates a new Pointer pointing the field in property schemas.
func PointFieldOnly(fid FieldID) *Pointer {
	return &Pointer{
		field: &fid,
	}
}

// PointItemBySchema creates a new Pointer pointing the schema item in property schemas.
func PointItemBySchema(sg SchemaGroupID) *Pointer {
	return &Pointer{
		schemaItem: &sg,
	}
}

// PointItem creates a new Pointer pointing to the item in properties.
func PointItem(i ItemID) *Pointer {
	return &Pointer{
		item: &i,
	}
}

// PointFieldBySchemaGroup creates a new Pointer pointing to the field of the schema field in properties.
func PointFieldBySchemaGroup(sg SchemaGroupID, f FieldID) *Pointer {
	return &Pointer{
		schemaItem: &sg,
		field:      &f,
	}
}

// PointFieldByItem creates a new Pointer pointing to the field of the item in properties.
func PointFieldByItem(i ItemID, f FieldID) *Pointer {
	return &Pointer{
		item:  &i,
		field: &f,
	}
}

func (p *Pointer) Clone() *Pointer {
	if p == nil {
		return nil
	}
	return &Pointer{
		field:      p.field.CopyRef(),
		item:       p.item.CopyRef(),
		schemaItem: p.schemaItem.CopyRef(),
	}
}

func (p *Pointer) ItemBySchemaGroupAndItem() (i SchemaGroupID, i2 ItemID, ok bool) {
	if p == nil || p.schemaItem == nil || p.item == nil {
		ok = false
		return
	}
	i = *p.schemaItem
	i2 = *p.item
	ok = true
	return
}

func (p *Pointer) ItemBySchemaGroup() (i SchemaGroupID, ok bool) {
	if p == nil || p.schemaItem == nil {
		ok = false
		return
	}
	i = *p.schemaItem
	ok = true
	return
}

func (p *Pointer) SchemaGroupAndItem() (i SchemaGroupID, i2 ItemID, ok bool) {
	ok = false
	if p == nil {
		return
	}
	if p.schemaItem != nil {
		i = *p.schemaItem
		ok = true
	}
	if p.item != nil {
		i2 = *p.item
		ok = true
	}
	return
}

func (p *Pointer) Item() (i ItemID, ok bool) {
	if p == nil || p.item == nil {
		ok = false
		return
	}
	i = *p.item
	ok = true
	return
}

func (p *Pointer) ItemRef() *ItemID {
	if p == nil || p.item == nil {
		return nil
	}
	f := *p.item
	return &f
}

func (p *Pointer) FieldByItem() (i ItemID, f FieldID, ok bool) {
	if p == nil || p.item == nil || p.schemaItem != nil || p.field == nil {
		ok = false
		return
	}
	i = *p.item
	f = *p.field
	ok = true
	return
}

func (p *Pointer) FieldBySchemaGroup() (sg SchemaGroupID, f FieldID, ok bool) {
	if p == nil || p.schemaItem == nil || p.item != nil || p.field == nil {
		ok = false
		return
	}
	sg = *p.schemaItem
	f = *p.field
	ok = true
	return
}

func (p *Pointer) Field() (f FieldID, ok bool) {
	if p == nil || p.field == nil {
		ok = false
		return
	}
	f = *p.field
	ok = true
	return
}

func (p *Pointer) FieldRef() *FieldID {
	if p == nil || p.field == nil {
		return nil
	}
	f := *p.field
	return &f
}

func (p *Pointer) GetAll() (sg *SchemaGroupID, i *ItemID, f *FieldID) {
	if p == nil {
		return
	}
	sg = p.schemaItem.CopyRef()
	i = p.item.CopyRef()
	f = p.field.CopyRef()
	return
}
