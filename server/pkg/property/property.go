package property

import (
	"context"
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/pkg/dataset"
)

type Property struct {
	id     ID
	scene  SceneID
	schema SchemaID
	items  []Item
}

func (p *Property) ID() ID {
	return p.id
}

func (p *Property) IDRef() *ID {
	if p == nil {
		return nil
	}
	return p.id.Ref()
}

func (p *Property) Scene() SceneID {
	return p.scene
}

func (p *Property) Schema() SchemaID {
	return p.schema
}

func (p *Property) Field(ptr *Pointer) (*Field, *GroupList, *Group) {
	if p == nil || ptr == nil {
		return nil, nil, nil
	}

	if g, gl := p.GroupAndList(ptr); g != nil {
		if fields := g.Fields(ptr); len(fields) > 0 {
			return fields[0], gl, g
		}
	}

	return nil, nil, nil
}

func (p *Property) Items() []Item {
	if p == nil {
		return nil
	}
	return append([]Item{}, p.items...)
}

func (p *Property) Item(ptr *Pointer) Item {
	if p == nil || ptr == nil || ptr.FieldOnlyRef() != nil {
		return nil
	}

	for _, i := range p.items {
		if ptr.TestItem(i.SchemaGroup(), i.ID()) {
			return i
		}
	}

	return nil
}

func (p *Property) GroupAndList(ptr *Pointer) (*Group, *GroupList) {
	if p == nil || ptr == nil {
		return nil, nil
	}

	for _, i := range p.items {
		if ptr.TestSchemaGroup(i.SchemaGroup()) {
			if gl := ToGroupList(i); gl != nil {
				return gl.GroupByPointer(ptr), gl
			} else if g := ToGroup(i); g != nil {
				return g, nil
			}
		}
	}

	return nil, nil
}

// ItemBySchema returns a root item by a schema group ID.
func (p *Property) ItemBySchema(id SchemaGroupID) Item {
	if p == nil {
		return nil
	}
	for _, f := range p.items {
		if f.SchemaGroup() == id {
			return f
		}
	}
	return nil
}

func (p *Property) GroupBySchema(id SchemaGroupID) *Group {
	i := p.ItemBySchema(id)
	if i == nil {
		return nil
	}
	if g := ToGroup(i); g != nil {
		return g
	}
	return nil
}

func (p *Property) GroupListBySchema(id SchemaGroupID) *GroupList {
	i := p.ItemBySchema(id)
	if i == nil {
		return nil
	}
	if g := ToGroupList(i); g != nil {
		return g
	}
	return nil
}

func (p *Property) ListItem(ptr *Pointer) (*Group, *GroupList) {
	if p == nil {
		return nil, nil
	}
	if sgid, i, ok := ptr.ItemBySchemaGroupAndItem(); ok {
		if item := ToGroupList(p.ItemBySchema(sgid)); item != nil {
			return item.Group(i), item
		}
	} else if iid, ok := ptr.Item(); ok {
		for _, item := range p.items {
			litem := ToGroupList(item)
			if g := litem.Group(iid); g != nil {
				return g, litem
			}
		}
	} else if sgid, ok := ptr.ItemBySchemaGroup(); ok {
		if item := ToGroupList(p.ItemBySchema(sgid)); item != nil {
			return nil, item
		}
	}
	return nil, nil
}

func (p *Property) HasLinkedField() bool {
	if p == nil {
		return false
	}
	for _, f := range p.items {
		if f.HasLinkedField() {
			return true
		}
	}
	return false
}

func (p *Property) Clone() *Property {
	if p == nil {
		return nil
	}

	items := make([]Item, 0, len(p.items))
	for _, i := range p.items {
		items = append(items, i.CloneItem())
	}

	return &Property{
		id:     p.id,
		schema: p.schema,
		scene:  p.scene,
		items:  items,
	}
}

func (p *Property) Fields(ptr *Pointer) []*Field {
	if p == nil || len(p.items) == 0 {
		return nil
	}
	res := []*Field{}
	for _, g := range p.items {
		res = append(res, g.Fields(ptr)...)
	}
	return res
}

func (p *Property) RemoveFields(ptr *Pointer) (res bool) {
	if p == nil {
		return
	}
	for _, g := range p.items {
		if g.RemoveFields(ptr) {
			res = true
		}
	}
	return
}

func (p *Property) FieldsByLinkedDataset(s DatasetSchemaID, i DatasetID) []*Field {
	if p == nil {
		return nil
	}
	res := []*Field{}
	for _, g := range p.items {
		res = append(res, g.FieldsByLinkedDataset(s, i)...)
	}
	return res
}

func (p *Property) IsDatasetLinked(s DatasetSchemaID, i DatasetID) bool {
	if p == nil {
		return false
	}
	for _, g := range p.items {
		if g.IsDatasetLinked(s, i) {
			return true
		}
	}
	return false
}

func (p *Property) Datasets() []DatasetID {
	if p == nil {
		return nil
	}
	res := []DatasetID{}

	for _, f := range p.items {
		res = append(res, f.Datasets()...)
	}

	return res
}

func (p *Property) AddItem(i Item) bool {
	if p == nil || p.ItemBySchema(i.SchemaGroup()) != nil || p.Item(PointItem(i.ID())) != nil {
		return false
	}
	p.items = append(p.items, i)
	return true
}

func (p *Property) RemoveItem(ptr *Pointer) {
	if p == nil || ptr == nil {
		return
	}

	for i := 0; i < len(p.items); i++ {
		item := p.items[i]
		if ptr.TestItem(item.SchemaGroup(), item.ID()) {
			p.items = append(p.items[:i], p.items[i+1:]...)
			return
		}
	}
}

func (p *Property) RemoveField(ptr *Pointer) {
	if p == nil {
		return
	}

	fid, ok := ptr.Field()
	if !ok {
		return
	}

	item := p.Item(ptr)
	if group := ToGroup(item); group != nil {
		group.RemoveField(fid)
	} else if groupList := ToGroupList(item); groupList != nil {
		groupList.RemoveFields(ptr)
	}
}

func (p *Property) Prune() (res bool) {
	if p == nil {
		return
	}
	for _, i := range p.items {
		if i.Prune() {
			res = true
		}
		if i.IsEmpty() {
			p.RemoveItem(PointItem(i.ID()))
			res = true
		}
	}
	return
}

func (p *Property) UpdateValue(ps *Schema, ptr *Pointer, v *Value) (*Field, *GroupList, *Group, error) {
	field, gl, g, created := p.GetOrCreateField(ps, ptr)
	if field == nil || created && v == nil {
		// The field is empty and will be removed by prune, so it does not make sense
		// p.Prune()
		return nil, nil, nil, nil
	}

	if err := field.Update(v, ps.Groups().Field(field.Field())); err != nil {
		return nil, nil, nil, err
	}

	if v == nil {
		p.Prune()
		if field.IsEmpty() {
			field = nil
		}
	}

	return field, gl, g, nil
}

func (p *Property) UnlinkAllByDataset(s DatasetSchemaID, ds DatasetID) {
	fields := p.FieldsByLinkedDataset(s, ds)
	for _, f := range fields {
		f.Unlink()
	}
}

func (p *Property) GetOrCreateField(ps *Schema, ptr *Pointer) (*Field, *GroupList, *Group, bool) {
	if p == nil || ps == nil || ptr == nil || !ps.ID().Equal(p.Schema()) {
		return nil, nil, nil, false
	}

	if field, pgl, pg := p.Field(ptr); field != nil {
		return field, pgl, pg, false
	}

	// if the field does not exist, create it here

	fid, ok := ptr.Field()
	if !ok {
		return nil, nil, nil, false
	}
	g, gl := p.GetOrCreateGroup(ps, ptr)
	f2, ok := g.GetOrCreateField(ps, fid)
	return f2, gl, g, ok
}

func (p *Property) GetOrCreateItem(ps *Schema, ptr *Pointer) (Item, *GroupList) {
	if p == nil || ps == nil || ptr == nil || !ps.ID().Equal(p.Schema()) {
		return nil, nil
	}

	if g, gl := p.GroupAndList(ptr); g != nil || gl != nil {
		if g == nil {
			return gl, nil
		}
		return g, gl
	}

	psgid, ok := ptr.ItemBySchemaGroup()
	if !ok {
		return nil, nil
	}

	psg := ps.Groups().Group(psgid)
	if psg == nil {
		return nil, nil
	}

	ni := InitItemFrom(psg)
	if ni != nil {
		_ = p.AddItem(ni)
	}

	return ni, nil // root item
}

func (p *Property) GetOrCreateGroup(ps *Schema, ptr *Pointer) (*Group, *GroupList) {
	if p == nil || ps == nil || ptr == nil || !ps.ID().Equal(p.Schema()) {
		return nil, nil
	}

	var psg *SchemaGroup
	if psgid, ok := ptr.ItemBySchemaGroup(); ok {
		psg = ps.Groups().Group(psgid)
	} else if f, ok := ptr.Field(); ok {
		psg = ps.Groups().GroupByField(f)
	}
	if psg == nil {
		return nil, nil
	}

	item, gl := p.GetOrCreateItem(ps, ptr)
	return ToGroup(item), gl
}

func (p *Property) GetOrCreateRootGroup(ptr *Pointer) (*Group, bool) {
	if p == nil || ptr == nil {
		return nil, false
	}

	if i := p.Item(ptr); i != nil {
		return ToGroup(i), false
	}

	sg, ok := ptr.ItemBySchemaGroup()
	if !ok {
		return nil, false
	}

	ng, err := NewGroup().NewID().SchemaGroup(sg).Build()
	if err != nil {
		return nil, false
	}

	return ng, p.AddItem(ng)
}

func (p *Property) GetOrCreateGroupList(ps *Schema, ptr *Pointer) *GroupList {
	if p == nil || ps == nil || ptr == nil || !ps.ID().Equal(p.Schema()) {
		return nil
	}

	var psg *SchemaGroup
	if psgid, ok := ptr.ItemBySchemaGroup(); ok {
		psg = ps.Groups().Group(psgid)
	} else if f, ok := ptr.Field(); ok {
		psg = ps.Groups().GroupByField(f)
	}
	if psg == nil {
		return nil
	}

	item, _ := p.GetOrCreateItem(ps, ptr)
	return ToGroupList(item)
}

func (p *Property) AddListItem(ps *Schema, ptr *Pointer, index *int) (*Group, *GroupList) {
	item, _ := p.GetOrCreateItem(ps, ptr)
	pgl := ToGroupList(item)
	if pgl == nil {
		return nil, nil
	}
	return pgl.CreateAndAddListItem(ps, index), pgl
}

func (p *Property) MoveListItem(ptr *Pointer, i int) (*Group, *GroupList) {
	if ptr == nil {
		return nil, nil
	}
	g, l := p.ListItem(ptr)
	if g == nil || l == nil {
		return nil, nil
	}
	l.Move(g.ID(), i)
	return g, l
}

func (p *Property) RemoveListItem(ptr *Pointer) bool {
	if p == nil || ptr == nil {
		return false
	}
	g, l := p.ListItem(ptr)
	if g == nil || l == nil {
		return false
	}
	ok := l.Remove(g.ID())
	if ok {
		p.Prune()
	}
	return ok
}

func (p *Property) UpdateLinkableValue(s *Schema, v *Value) {
	if s == nil || p == nil || v == nil {
		return
	}

	sfid := s.linkable.FieldByType(v.Type())
	if sfid == nil {
		return
	}

	sf := s.Groups().GroupAndField(*sfid)
	if sf == nil {
		return
	}

	f, _, _, ok := p.GetOrCreateField(s, sf.Pointer())
	if ok {
		if err := f.Update(v, sf.Field); err != nil {
			p.Prune()
		}
	}
}

func (p *Property) AutoLinkField(s *Schema, v ValueType, d DatasetSchemaID, df *DatasetFieldID, ds *DatasetID) {
	if s == nil || p == nil || df == nil {
		return
	}

	sfid := s.linkable.FieldByType(v)
	if sfid == nil {
		return
	}

	sf := s.Groups().GroupAndField(*sfid)
	if sf == nil {
		return
	}

	f, _, _, ok := p.GetOrCreateField(s, sf.Pointer())
	if ok {
		if ds == nil {
			f.Link(NewLinks([]*Link{NewLinkFieldOnly(d, *df)}))
		} else {
			f.Link(NewLinks([]*Link{NewLink(*ds, d, *df)}))
		}
	}
}

// TODO: group migration
func (p *Property) MigrateSchema(ctx context.Context, newSchema *Schema, dl dataset.Loader) {
	if p == nil || dl == nil {
		return
	}
	p.schema = newSchema.ID()

	for _, f := range p.items {
		f.MigrateSchema(ctx, newSchema, dl)
	}

	p.Prune()
}

func (p *Property) MigrateDataset(q DatasetMigrationParam) {
	if p == nil {
		return
	}
	for _, f := range p.items {
		f.MigrateDataset(q)
	}
	p.Prune()
}

func (p *Property) ValidateSchema(ps *Schema) error {
	if p == nil {
		return nil
	}
	if ps == nil {
		return errors.New("invalid schema")
	}
	if p.schema != ps.ID() {
		return errors.New("invalid schema id")
	}

	for _, i := range p.items {
		sg := i.SchemaGroup()
		if err := i.ValidateSchema(ps.Groups().Group(sg)); err != nil {
			return fmt.Errorf("%s (%s): %w", p.ID(), sg, err)
		}
	}

	return nil
}

// MoveFields moves fields between items. Only fields in Groups can be moved to another Group, fields in GroupLists will simply be deleted.
func (p *Property) MoveFields(from, to *Pointer) (res bool) {
	if p == nil {
		return
	}

	fields := p.GroupAndFields(from)
	if len(fields) == 0 {
		return
	}

	toGroup, created := p.GetOrCreateRootGroup(to)
	if created {
		res = true
	}

	for _, f := range fields {
		if f.Group.RemoveField(f.Field.Field()) {
			res = true
		}
		// For root group only
		if f.ParentGroup == nil && toGroup != nil {
			// NOTE: currently changing the field ID is not supported
			toGroup.AddFields(f.Field)
			res = true
		}
	}

	return
}

func (p *Property) GroupAndFields(ptr *Pointer) []GroupAndField {
	if p == nil || len(p.items) == 0 {
		return nil
	}
	res := []GroupAndField{}
	for _, i := range p.items {
		if ptr == nil || ptr.TestSchemaGroup(i.SchemaGroup()) {
			res = append(res, i.GroupAndFields(ptr)...)
		}
	}
	return res
}

// Cast changes the type of fields that are matches the pointer
func (p *Property) Cast(ptr *Pointer, t ValueType) (res bool) {
	for _, f := range p.Fields(ptr) {
		if f.Cast(t) {
			res = true
		}
	}
	return
}

func (p *Property) GuessSchema() *Schema {
	if p == nil {
		return nil
	}

	groups := make([]*SchemaGroup, 0, len(p.items))
	for _, i := range p.items {
		if g := i.GuessSchema(); g != nil {
			groups = append(groups, g)
		}
	}

	if s, err := NewSchema().ID(p.Schema()).Groups(NewSchemaGroupList(groups)).Build(); err == nil {
		return s
	}
	return nil
}

func (p *Property) updateSchema(s SchemaID) bool {
	if p == nil || s.IsNil() || p.schema.Equal(s) {
		return false
	}
	p.schema = s.Clone()
	return true
}

func (p *Property) SetSchema(schema SchemaID) {
	p.schema = schema.Clone()
}

func PropertyCacheKey(id ID) string {
	return fmt.Sprintf("Property:%s", id)
}
