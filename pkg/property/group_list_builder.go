package property

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
		return nil, ErrInvalidID
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

func (b *GroupListBuilder) ID(id ItemID) *GroupListBuilder {
	b.p.itemBase.ID = id
	return b
}

func (b *GroupListBuilder) NewID() *GroupListBuilder {
	b.p.itemBase.ID = NewItemID()
	return b
}

func (b *GroupListBuilder) SchemaGroup(g SchemaGroupID) *GroupListBuilder {
	b.p.itemBase.SchemaGroup = g
	return b
}

func (b *GroupListBuilder) Groups(fields []*Group) *GroupListBuilder {
	newGroups := []*Group{}
	ids := map[ItemID]struct{}{}
	for _, f := range fields {
		if f == nil {
			continue
		}
		if _, ok := ids[f.ID()]; ok {
			continue
		}
		ids[f.ID()] = struct{}{}
		newGroups = append(newGroups, f)
	}
	b.p.groups = newGroups
	return b
}
