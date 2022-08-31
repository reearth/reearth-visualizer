package property

// Pointer is a pointer to a field and an item in properties and schemas
type Pointer struct {
	schemaGroup *SchemaGroupID
	item        *ItemID
	field       *FieldID
}

// NewPointer creates a new Pointer.
func NewPointer(sg *SchemaGroupID, i *ItemID, f *FieldID) *Pointer {
	if sg == nil && i == nil && f == nil {
		return nil
	}
	return &Pointer{
		schemaGroup: sg.CloneRef(),
		item:        i.CloneRef(),
		field:       f.CloneRef(),
	}
}

// PointToEverything creates a new Pointer pointing to all items and fields.
func PointToEverything() *Pointer {
	return &Pointer{}
}

// PointField creates a new Pointer pointing the field in properties.
func PointField(sg *SchemaGroupID, i *ItemID, f FieldID) *Pointer {
	return &Pointer{
		schemaGroup: sg.CloneRef(),
		item:        i.CloneRef(),
		field:       &f,
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
		schemaGroup: &sg,
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
		schemaGroup: &sg,
		field:       &f,
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
		field:       p.field.CloneRef(),
		item:        p.item.CloneRef(),
		schemaGroup: p.schemaGroup.CloneRef(),
	}
}

func (p *Pointer) ItemBySchemaGroupAndItem() (i SchemaGroupID, i2 ItemID, ok bool) {
	if p == nil || p.schemaGroup == nil || p.item == nil {
		ok = false
		return
	}
	i = *p.schemaGroup
	i2 = *p.item
	ok = true
	return
}

func (p *Pointer) ItemBySchemaGroup() (i SchemaGroupID, ok bool) {
	if p == nil || p.schemaGroup == nil {
		ok = false
		return
	}
	i = *p.schemaGroup
	ok = true
	return
}

func (p *Pointer) SchemaGroupAndItem() (i SchemaGroupID, i2 ItemID, ok bool) {
	ok = false
	if p == nil {
		return
	}
	if p.schemaGroup != nil {
		i = *p.schemaGroup
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
	if p == nil {
		return nil
	}
	return p.item.CloneRef()
}

func (p *Pointer) FieldByItem() (i ItemID, f FieldID, ok bool) {
	if p == nil || p.item == nil || p.schemaGroup != nil || p.field == nil {
		ok = false
		return
	}
	i = *p.item
	f = *p.field
	ok = true
	return
}

func (p *Pointer) FieldBySchemaGroup() (sg SchemaGroupID, f FieldID, ok bool) {
	if p == nil || p.schemaGroup == nil || p.item != nil || p.field == nil {
		ok = false
		return
	}
	sg = *p.schemaGroup
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
	f, ok := p.Field()
	if !ok {
		return nil
	}
	return f.Ref()
}

func (p *Pointer) FieldOnly() (f FieldID, ok bool) {
	if p == nil || p.field == nil || p.item != nil || p.schemaGroup != nil {
		ok = false
		return
	}
	f = *p.field
	ok = true
	return
}

func (p *Pointer) FieldOnlyRef() *FieldID {
	f, ok := p.FieldOnly()
	if !ok {
		return nil
	}
	return f.Ref()
}

func (p *Pointer) FieldIfItemIs(sg SchemaGroupID, i ItemID) (f FieldID, ok bool) {
	if p == nil || p.field == nil || !p.TestItem(sg, i) {
		ok = false
		return
	}
	f = *p.field
	ok = true
	return
}

func (p *Pointer) FieldIfItemIsRef(sg SchemaGroupID, i ItemID) *FieldID {
	f, ok := p.FieldIfItemIs(sg, i)
	if !ok {
		return nil
	}
	return f.Ref()
}

func (p *Pointer) Test(sg SchemaGroupID, i ItemID, f FieldID) bool {
	return p.TestItem(sg, i) && p.TestField(f)
}

func (p *Pointer) TestItem(sg SchemaGroupID, i ItemID) bool {
	return p.TestSchemaGroup(sg) && (p.item == nil || *p.item == i)
}

func (p *Pointer) TestSchemaGroup(sg SchemaGroupID) bool {
	return p != nil && (p.schemaGroup == nil || *p.schemaGroup == sg)
}

func (p *Pointer) TestField(f FieldID) bool {
	return p != nil && (p.field == nil || *p.field == f)
}

func (p *Pointer) AllFields() *Pointer {
	if p == nil || p.schemaGroup == nil && p.item == nil {
		return nil
	}
	return &Pointer{
		schemaGroup: p.schemaGroup.CloneRef(),
		item:        p.item.CloneRef(),
		field:       nil,
	}
}

func (p *Pointer) GetAll() (sg *SchemaGroupID, i *ItemID, f *FieldID) {
	if p == nil {
		return
	}
	sg = p.schemaGroup.CloneRef()
	i = p.item.CloneRef()
	f = p.field.CloneRef()
	return
}
