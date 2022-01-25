package property

import (
	"context"
	"errors"
	"fmt"

	"github.com/reearth/reearth-backend/pkg/dataset"
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

	if iid, fid, ok := ptr.FieldByItem(); ok {
		if i, gl := p.Item(iid); i != nil {
			g := ToGroup(i)
			return g.Field(fid), gl, g
		}
	} else if sgid, fid, ok := ptr.FieldBySchemaGroup(); ok {
		if i := p.ItemBySchema(sgid); i != nil {
			g := ToGroup(i)
			return g.Field(fid), nil, g
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

func (p *Property) Item(id ItemID) (Item, *GroupList) {
	if p == nil {
		return nil, nil
	}
	for _, f := range p.items {
		if f.ID() == id {
			return f, nil
		}
		if gl := ToGroupList(f); gl != nil {
			if i := gl.Group(id); i != nil {
				return i, gl
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

func (p *Property) ItemByPointer(ptr *Pointer) (Item, *GroupList) {
	if p == nil || ptr == nil {
		return nil, nil
	}
	if pid, ok := ptr.Item(); ok {
		return p.Item(pid)
	} else if sgid, ok := ptr.ItemBySchemaGroup(); ok {
		return p.ItemBySchema(sgid), nil
	}
	return nil, nil
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

func (p *Property) RemoveItem(ptr *Pointer) {
	if p == nil {
		return
	}
	sgid, iid, ok := ptr.SchemaGroupAndItem()
	if !ok {
		return
	}
	for i, item := range p.items {
		if item.ID() == iid || item.SchemaGroup() == sgid {
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

	item, _ := p.ItemByPointer(ptr)
	if group := ToGroup(item); group != nil {
		group.RemoveField(fid)
	}
}

func (p *Property) Prune() {
	if p == nil {
		return
	}
	for _, f := range p.items {
		if f.IsEmpty() {
			p.RemoveItem(PointItem(f.ID()))
		}
	}
}

func (p *Property) UpdateValue(ps *Schema, ptr *Pointer, v *Value) (*Field, *GroupList, *Group, error) {
	field, gl, g, created := p.GetOrCreateField(ps, ptr)
	if field == nil || created && v == nil {
		// The field is empty and will be removed by prune, so it does not make sense
		return nil, nil, nil, nil
	}

	if err := field.Update(v, ps.Field(field.Field())); err != nil {
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

	if item, pgl := p.ItemByPointer(ptr); item != nil {
		return item, pgl
	}

	psgid, ok := ptr.ItemBySchemaGroup()
	if !ok {
		return nil, nil
	}

	psg := ps.Group(psgid)
	if psg == nil {
		return nil, nil
	}

	ni := InitItemFrom(psg)
	if ni != nil {
		if p.items == nil {
			p.items = []Item{ni}
		} else {
			p.items = append(p.items, ni)
		}
	}

	return ni, nil // root item
}

func (p *Property) GetOrCreateGroup(ps *Schema, ptr *Pointer) (*Group, *GroupList) {
	if p == nil || ps == nil || ptr == nil || !ps.ID().Equal(p.Schema()) {
		return nil, nil
	}

	var psg *SchemaGroup
	if psgid, ok := ptr.ItemBySchemaGroup(); ok {
		psg = ps.Group(psgid)
	} else if f, ok := ptr.Field(); ok {
		psg = ps.GroupByField(f)
	}
	if psg == nil {
		return nil, nil
	}

	item, gl := p.GetOrCreateItem(ps, ptr)
	return ToGroup(item), gl
}

func (p *Property) GetOrCreateGroupList(ps *Schema, ptr *Pointer) *GroupList {
	if p == nil || ps == nil || ptr == nil || !ps.ID().Equal(p.Schema()) {
		return nil
	}

	var psg *SchemaGroup
	if psgid, ok := ptr.ItemBySchemaGroup(); ok {
		psg = ps.Group(psgid)
	} else if f, ok := ptr.Field(); ok {
		psg = ps.GroupByField(f)
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

	var ptr *Pointer
	switch v.Type() {
	case ValueTypeLatLng:
		ptr = s.linkable.LatLng
	case ValueTypeURL:
		ptr = s.linkable.URL
	}

	sf := s.FieldByPointer(ptr)
	if sf == nil {
		return
	}

	f, _, _, ok := p.GetOrCreateField(s, ptr)
	if ok {
		if err := f.Update(v, sf); err != nil {
			p.Prune()
		}
	}
}

func (p *Property) AutoLinkField(s *Schema, v ValueType, d DatasetSchemaID, df *DatasetFieldID, ds *DatasetID) {
	if s == nil || p == nil || df == nil {
		return
	}

	var ptr *Pointer
	switch v {
	case ValueTypeLatLng:
		ptr = s.linkable.LatLng
	case ValueTypeURL:
		ptr = s.linkable.URL
	}

	sf := s.FieldByPointer(ptr)
	if sf == nil {
		return
	}

	f, _, _, ok := p.GetOrCreateField(s, ptr)
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
		if err := i.ValidateSchema(ps.Group(sg)); err != nil {
			return fmt.Errorf("%s (%s): %w", p.ID(), sg, err)
		}
	}

	return nil
}
