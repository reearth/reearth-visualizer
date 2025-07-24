package property

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
)

var ErrInvalidGroupInGroupList = errors.New("cannot contain an invalid property group in the property group list")

type GroupListBuilder struct {
	p *GroupList
}

func NewGroupList() *GroupListBuilder {
	return &GroupListBuilder{
		p: &GroupList{},
	}
}

func InitGroupListFrom(g *SchemaGroup) *GroupList {
	if g == nil || !g.IsList() {
		return nil
	}
	g2, _ := NewGroupList().NewID().SchemaGroup(g.ID()).Build()
	return g2
}

func (b *GroupListBuilder) Build() (*GroupList, error) {
	if b.p.itemBase.ID.IsNil() {
		return nil, errors.New("invalid ID itemBase.ID ")
	}
	if b.p.itemBase.SchemaGroup == "" {
		return nil, errors.New("invalid ID itemBase.SchemaGroup ")
	}
	for _, g := range b.p.groups {
		if g.SchemaGroup() != b.p.SchemaGroup() {
			return nil, ErrInvalidGroupInGroupList
		}
	}
	return b.p, nil
}

func (b *GroupListBuilder) MustBuild() *GroupList {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *GroupListBuilder) base(base itemBase) *GroupListBuilder {
	b.p.itemBase = base
	return b
}

func (b *GroupListBuilder) ID(id id.PropertyItemID) *GroupListBuilder {
	b.p.itemBase.ID = id
	return b
}

func (b *GroupListBuilder) NewID() *GroupListBuilder {
	b.p.itemBase.ID = id.NewPropertyItemID()
	return b
}

func (b *GroupListBuilder) SchemaGroup(g id.PropertySchemaGroupID) *GroupListBuilder {
	b.p.itemBase.SchemaGroup = g
	return b
}

func (b *GroupListBuilder) Groups(groups []*Group) *GroupListBuilder {
	newGroups := []*Group{}
	ids := map[id.PropertyItemID]struct{}{}
	for _, g := range groups {
		if g == nil {
			continue
		}
		if _, ok := ids[g.ID()]; ok {
			continue
		}
		ids[g.ID()] = struct{}{}
		newGroups = append(newGroups, g)
	}
	b.p.groups = newGroups
	return b
}
