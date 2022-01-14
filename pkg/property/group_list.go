package property

import (
	"context"
	"errors"
	"fmt"

	"github.com/reearth/reearth-backend/pkg/dataset"
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

func (g *GroupList) Schema() SchemaID {
	if g == nil {
		return SchemaID{}
	}
	return g.itemBase.Schema
}

func (g *GroupList) SchemaRef() *SchemaID {
	if g == nil {
		return nil
	}
	return g.itemBase.Schema.Ref()
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

func (g *GroupList) CollectDatasets() []DatasetID {
	if g == nil {
		return nil
	}
	res := []DatasetID{}

	for _, f := range g.groups {
		res = append(res, f.CollectDatasets()...)
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

func (g *GroupList) Prune() {
	if g == nil {
		return
	}
	for _, f := range g.groups {
		f.Prune()
	}
}

func (g *GroupList) MigrateSchema(ctx context.Context, newSchema *Schema, dl dataset.Loader) {
	if g == nil || dl == nil {
		return
	}

	g.itemBase.Schema = newSchema.ID()

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

// GetGroup returns a group whose id is specified
func (g *GroupList) GetGroup(gid ItemID) *Group {
	if g == nil {
		return nil
	}
	for _, f := range g.groups {
		if f.ID() == gid {
			return f
		}
	}
	return nil
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
	for _, gg := range g.groups {
		if gg.ID() == i {
			return true
		}
	}
	return false
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
	if g == nil || ptr == nil || ps == nil || ps.ID() != g.Schema() {
		return nil, false
	}
	psg := ps.Group(g.SchemaGroup())
	if psg == nil {
		return nil, false
	}

	item, fid, ok := ptr.FieldByItem()
	if !ok {
		return nil, false
	}

	i := g.GetGroup(item)
	if i == nil {
		return nil, false
	}

	return i.GetOrCreateField(ps, fid)
}

func (g *GroupList) CreateAndAddListItem(ps *Schema, index *int) *Group {
	if g == nil || ps == nil || !g.Schema().Equal(ps.ID()) {
		return nil
	}
	psg := ps.Group(g.SchemaGroup())
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
	if !p.Schema().Equal(ps.Schema()) {
		return errors.New("invalid schema id")
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
