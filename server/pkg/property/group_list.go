package property

import (
	"context"
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearthx/util"
)

type GroupList struct {
	itemBase
	groups []*Group
}

// List implements Item interface
var _ Item = &GroupList{}

// ID returns id
func (g *GroupList) ID() ItemID {
	if g == nil {
		return ItemID{}
	}
	return g.itemBase.ID
}

// IDRef returns a reference of id
func (g *GroupList) IDRef() *ItemID {
	if g == nil {
		return nil
	}
	return g.itemBase.ID.Ref()
}

// SchemaGroup returns id of schema group
func (g *GroupList) SchemaGroup() SchemaGroupID {
	if g == nil {
		return SchemaGroupID("")
	}
	return g.itemBase.SchemaGroup
}

func (g *GroupList) SchemaGroupRef() *SchemaGroupID {
	if g == nil {
		return nil
	}
	return g.itemBase.SchemaGroup.Ref()
}

func (g *GroupList) HasLinkedField() bool {
	if g == nil {
		return false
	}
	for _, f := range g.groups {
		if f.HasLinkedField() {
			return true
		}
	}
	return false
}

func (g *GroupList) Datasets() []DatasetID {
	if g == nil {
		return nil
	}
	res := []DatasetID{}

	for _, f := range g.groups {
		res = append(res, f.Datasets()...)
	}

	return res
}

func (g *GroupList) FieldsByLinkedDataset(s DatasetSchemaID, i DatasetID) []*Field {
	if g == nil {
		return nil
	}
	res := []*Field{}
	for _, g := range g.groups {
		res = append(res, g.FieldsByLinkedDataset(s, i)...)
	}
	return res
}

func (g *GroupList) IsDatasetLinked(s DatasetSchemaID, i DatasetID) bool {
	if g == nil {
		return false
	}
	for _, d := range g.groups {
		if d.IsDatasetLinked(s, i) {
			return true
		}
	}
	return false
}

func (g *GroupList) IsEmpty() bool {
	return g != nil && (g.groups == nil || len(g.groups) == 0)
}

func (g *GroupList) Prune() (res bool) {
	if g == nil {
		return
	}
	for _, f := range g.groups {
		if f.Prune() {
			res = true
		}
	}
	return
}

func (g *GroupList) MigrateSchema(ctx context.Context, newSchema *Schema, dl dataset.Loader) {
	if g == nil || dl == nil {
		return
	}

	for _, f := range g.groups {
		f.MigrateSchema(ctx, newSchema, dl)
	}

	g.Prune()
}

// Groups returns a slice of groups
func (g *GroupList) Groups() []*Group {
	if g == nil {
		return nil
	}
	return append([]*Group{}, g.groups...)
}

// Group returns a group whose id is specified
func (g *GroupList) Group(gid ItemID) *Group {
	if g == nil {
		return nil
	}
	for _, g := range g.groups {
		if g.ID() == gid {
			return g
		}
	}
	return nil
}

func (g *GroupList) GroupByPointer(ptr *Pointer) *Group {
	if g == nil {
		return nil
	}
	gid, ok := ptr.Item()
	if !ok {
		return nil
	}
	return g.Group(gid)
}

func (p *GroupList) Clone() *GroupList {
	if p == nil {
		return nil
	}
	groups := make([]*Group, 0, len(p.groups))
	for _, g := range p.groups {
		groups = append(groups, g.Clone())
	}
	return &GroupList{
		groups:   groups,
		itemBase: p.itemBase,
	}
}

func (p *GroupList) CloneItem() Item {
	return p.Clone()
}

func (g *GroupList) Fields(ptr *Pointer) []*Field {
	if g == nil || len(g.groups) == 0 || (ptr != nil && !ptr.TestSchemaGroup(g.SchemaGroup())) {
		return nil
	}

	if pi, ok := ptr.Item(); ok && g.ID() != pi {
		return g.Group(pi).Fields(ptr)
	}

	if fid, ok := ptr.Field(); ok {
		ptr = PointFieldOnly(fid)
	}

	var fields []*Field
	for _, g := range g.groups {
		if f := g.Fields(ptr); len(f) > 0 {
			fields = append(fields, f...)
		}
	}
	return fields
}

func (g *GroupList) RemoveFields(ptr *Pointer) (res bool) {
	if g == nil {
		return
	}

	if i, ok := ptr.Item(); ok && g.ID() != i {
		return g.GroupByPointer(ptr).RemoveFields(ptr)
	}

	if i, ok := ptr.ItemBySchemaGroup(); ok && g.SchemaGroup() != i {
		return g.GroupByPointer(ptr).RemoveFields(ptr)
	}

	if fid, ok := ptr.Field(); ok {
		for _, g := range g.groups {
			if g.RemoveField(fid) {
				res = true
			}
		}
	}

	return
}

func (p *GroupList) GroupAndFields(ptr *Pointer) []GroupAndField {
	if p == nil || len(p.groups) == 0 {
		return nil
	}
	res := []GroupAndField{}
	for _, g := range p.groups {
		if ptr == nil || ptr.TestItem(g.SchemaGroup(), g.ID()) {
			for _, r := range g.GroupAndFields(ptr) {
				res = append(res, GroupAndField{
					ParentGroup: p,
					Group:       r.Group,
					Field:       r.Field,
				})
			}
		}
	}
	return res
}

func (g *GroupList) GuessSchema() *SchemaGroup {
	if g == nil {
		return nil
	}

	fieldm := map[FieldID]struct{}{}
	fields := []*SchemaField{}

	for _, g := range g.groups {
		if gsg := g.GuessSchema(); gsg != nil {
			for _, f := range gsg.Fields() {
				if _, ok := fieldm[f.ID()]; ok {
					continue
				}
				fields = append(fields, f)
				fieldm[f.ID()] = struct{}{}
			}
		}
	}

	// TODO: error handling
	sg, _ := NewSchemaGroup().ID(g.SchemaGroup()).IsList(true).Fields(fields).Build()
	return sg
}

// GroupAt returns a group whose index is specified
func (g *GroupList) GroupAt(i int) *Group {
	if g == nil || i < 0 || i > len(g.groups)-1 {
		return nil
	}
	return g.groups[i]
}

func (g *GroupList) Has(i ItemID) bool {
	if g == nil {
		return false
	}
	return util.ListHas[ItemID, Group](g.groups, (*Group).ID, i)
}

func (g *GroupList) Count() int {
	if g == nil {
		return 0
	}
	return len(g.groups)
}

func (g *GroupList) Add(gg *Group, index int) {
	if g == nil || g.Has(gg.ID()) {
		return
	}

	le := len(g.groups)
	if index < 0 || le <= index {
		g.groups = append(g.groups, gg)
	} else {
		g.groups = append(g.groups[:index], append([]*Group{gg}, g.groups[index:]...)...)
	}
}

func (g *GroupList) AddOrMove(gg *Group, index int) {
	if g == nil {
		return
	}

	le := len(g.groups)
	if index < 0 || le <= index {
		index = le
	}

	gid := gg.ID()
	if g.Has(gid) {
		g.Move(gid, index)
		return
	}
	g.groups = append(g.groups[:index], append([]*Group{gg}, g.groups[index:]...)...)
}

func (g *GroupList) Move(id ItemID, toIndex int) {
	if g == nil {
		return
	}

	for fromIndex, gg := range g.groups {
		if gg.ID() == id {
			g.MoveAt(fromIndex, toIndex)
			return
		}
	}
}

func (g *GroupList) MoveAt(fromIndex int, toIndex int) {
	if g == nil {
		return
	}

	le := len(g.groups)
	if fromIndex < 0 || le <= fromIndex {
		return
	}
	if toIndex < 0 || le <= toIndex {
		toIndex = le - 1
	}
	if fromIndex == toIndex {
		return
	}

	f := g.groups[fromIndex]
	g.groups = append(g.groups[:fromIndex], g.groups[fromIndex+1:]...)
	newSlice := make([]*Group, toIndex+1)
	copy(newSlice, g.groups[:toIndex])
	newSlice[toIndex] = f
	g.groups = append(newSlice, g.groups[toIndex:]...)
}

func (g *GroupList) Remove(id ItemID) bool {
	if g == nil {
		return false
	}

	for index, gg := range g.groups {
		if gg.ID() == id {
			g.RemoveAt(index)
			return true
		}
	}

	return false
}

func (g *GroupList) RemoveAt(index int) {
	if g == nil {
		return
	}

	le := len(g.groups)
	if index < 0 || le <= index {
		return
	}
	var groups []*Group
	if index == le {
		groups = []*Group{}
	} else {
		groups = g.groups[index+1:]
	}
	g.groups = append(g.groups[:index], groups...)
}

func (g *GroupList) Empty() {
	if g == nil {
		return
	}

	g.groups = []*Group{}
}

func (g *GroupList) GetOrCreateField(ps *Schema, ptr *Pointer) (*Field, bool) {
	if g == nil || ptr == nil || ps == nil {
		return nil, false
	}
	psg := ps.Groups().Group(g.SchemaGroup())
	if psg == nil {
		return nil, false
	}

	item, fid, ok := ptr.FieldByItem()
	if !ok {
		return nil, false
	}

	i := g.Group(item)
	if i == nil {
		return nil, false
	}

	return i.GetOrCreateField(ps, fid)
}

func (g *GroupList) CreateAndAddListItem(ps *Schema, index *int) *Group {
	if g == nil || ps == nil {
		return nil
	}
	psg := ps.Groups().Group(g.SchemaGroup())
	if psg == nil {
		return nil
	}

	index2 := -1
	if index != nil {
		index2 = *index
	}

	if ni := InitGroupFrom(psg); ni != nil {
		g.Add(ni, index2)
		return ni
	}

	return nil
}

func (g *GroupList) MigrateDataset(q DatasetMigrationParam) {
	if g == nil {
		return
	}
	for _, f := range g.groups {
		f.MigrateDataset(q)
	}
}

func (p *GroupList) ValidateSchema(ps *SchemaGroup) error {
	if p == nil {
		return nil
	}
	if ps == nil {
		return errors.New("invalid schema")
	}
	if p.SchemaGroup() != ps.ID() {
		return errors.New("invalid schema group id")
	}

	for _, i := range p.groups {
		if err := i.ValidateSchema(ps); err != nil {
			return fmt.Errorf("%s: %w", i.ID(), err)
		}
	}

	return nil
}
