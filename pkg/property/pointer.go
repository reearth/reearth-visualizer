package property

import "github.com/reearth/reearth-backend/pkg/id"

// Pointer _
type Pointer struct {
	schemaGroup *id.PropertySchemaFieldID
	item        *id.PropertyItemID
	field       *id.PropertySchemaFieldID
}

// NewPointer _
func NewPointer(sg *id.PropertySchemaFieldID, i *id.PropertyItemID, f *id.PropertySchemaFieldID) *Pointer {
	if sg == nil && i == nil && f == nil {
		return nil
	}
	return &Pointer{
		schemaGroup: sg.CopyRef(),
		item:        i.CopyRef(),
		field:       f.CopyRef(),
	}
}

// PointField _
func PointField(sg *id.PropertySchemaFieldID, i *id.PropertyItemID, f id.PropertySchemaFieldID) *Pointer {
	return &Pointer{
		schemaGroup: sg.CopyRef(),
		item:        i.CopyRef(),
		field:       &f,
	}
}

// PointFieldOnly _
func PointFieldOnly(fid id.PropertySchemaFieldID) *Pointer {
	return &Pointer{
		field: &fid,
	}
}

// PointItemBySchema _
func PointItemBySchema(sg id.PropertySchemaFieldID) *Pointer {
	return &Pointer{
		schemaGroup: &sg,
	}
}

// PointItem _
func PointItem(i id.PropertyItemID) *Pointer {
	return &Pointer{
		item: &i,
	}
}

// PointFieldBySchemaGroup _
func PointFieldBySchemaGroup(sg id.PropertySchemaFieldID, f id.PropertySchemaFieldID) *Pointer {
	return &Pointer{
		schemaGroup: &sg,
		field:       &f,
	}
}

// PointFieldBySchemaGroupAndItem _
func PointFieldBySchemaGroupAndItem(sg id.PropertySchemaFieldID, i id.PropertyItemID) *Pointer {
	return &Pointer{
		schemaGroup: &sg,
		item:        &i,
	}
}

// PointFieldByItem _
func PointFieldByItem(i id.PropertyItemID, f id.PropertySchemaFieldID) *Pointer {
	return &Pointer{
		item:  &i,
		field: &f,
	}
}

// Clone _
func (p *Pointer) Clone() *Pointer {
	if p == nil {
		return nil
	}
	return &Pointer{
		field:       p.field.CopyRef(),
		item:        p.item.CopyRef(),
		schemaGroup: p.schemaGroup.CopyRef(),
	}
}

// ItemBySchemaGroupAndItem _
func (p *Pointer) ItemBySchemaGroupAndItem() (i id.PropertySchemaFieldID, i2 id.PropertyItemID, ok bool) {
	if p == nil || p.schemaGroup == nil || p.item == nil {
		ok = false
		return
	}
	i = *p.schemaGroup
	i2 = *p.item
	ok = true
	return
}

// ItemBySchemaGroup _
func (p *Pointer) ItemBySchemaGroup() (i id.PropertySchemaFieldID, ok bool) {
	if p == nil || p.schemaGroup == nil {
		ok = false
		return
	}
	i = *p.schemaGroup
	ok = true
	return
}

// SchemaGroupAndItem _
func (p *Pointer) SchemaGroupAndItem() (i id.PropertySchemaFieldID, i2 id.PropertyItemID, ok bool) {
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

// Item _
func (p *Pointer) Item() (i id.PropertyItemID, ok bool) {
	if p == nil || p.item == nil {
		ok = false
		return
	}
	i = *p.item
	ok = true
	return
}

func (p *Pointer) ItemRef() *id.PropertyItemID {
	if p == nil || p.item == nil {
		return nil
	}
	f := *p.item
	return &f
}

// FieldByItem _
func (p *Pointer) FieldByItem() (i id.PropertyItemID, f id.PropertySchemaFieldID, ok bool) {
	if p == nil || p.item == nil || p.schemaGroup != nil || p.field == nil {
		ok = false
		return
	}
	i = *p.item
	f = *p.field
	ok = true
	return
}

// FieldBySchemaGroup _
func (p *Pointer) FieldBySchemaGroup() (sg id.PropertySchemaFieldID, f id.PropertySchemaFieldID, ok bool) {
	if p == nil || p.schemaGroup == nil || p.item != nil || p.field == nil {
		ok = false
		return
	}
	sg = *p.schemaGroup
	f = *p.field
	ok = true
	return
}

// Field _
func (p *Pointer) Field() (f id.PropertySchemaFieldID, ok bool) {
	if p == nil || p.field == nil {
		ok = false
		return
	}
	f = *p.field
	ok = true
	return
}

func (p *Pointer) FieldRef() *id.PropertySchemaFieldID {
	if p == nil || p.field == nil {
		return nil
	}
	f := *p.field
	return &f
}

// GetAll _
func (p *Pointer) GetAll() (sg *id.PropertySchemaFieldID, i *id.PropertyItemID, f *id.PropertySchemaFieldID) {
	if p == nil {
		return
	}
	sg = p.schemaGroup.CopyRef()
	i = p.item.CopyRef()
	f = p.field.CopyRef()
	return
}
