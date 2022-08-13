package property

type GroupBuilder struct {
	p *Group
}

func NewGroup() *GroupBuilder {
	return &GroupBuilder{
		p: &Group{},
	}
}

func InitGroupFrom(g *SchemaGroup) *Group {
	if g == nil {
		return nil
	}
	g2, _ := NewGroup().NewID().SchemaGroup(g.ID()).Build()
	return g2
}

func (b *GroupBuilder) Build() (*Group, error) {
	if b.p.itemBase.ID.IsNil() {
		return nil, ErrInvalidID
	}
	if b.p.itemBase.SchemaGroup == "" {
		return nil, ErrInvalidID
	}
	return b.p, nil
}

func (b *GroupBuilder) MustBuild() *Group {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *GroupBuilder) base(base itemBase) *GroupBuilder {
	b.p.itemBase = base
	return b
}

func (b *GroupBuilder) ID(id ItemID) *GroupBuilder {
	b.p.itemBase.ID = id
	return b
}

func (b *GroupBuilder) NewID() *GroupBuilder {
	nid := NewItemID
	b.p.itemBase.ID = nid()
	return b
}

func (b *GroupBuilder) SchemaGroup(g SchemaGroupID) *GroupBuilder {
	b.p.itemBase.SchemaGroup = g
	return b
}

func (b *GroupBuilder) Fields(fields []*Field) *GroupBuilder {
	var newFields []*Field
	ids := map[FieldID]struct{}{}
	for _, f := range fields {
		if f == nil {
			continue
		}
		if _, ok := ids[f.Field()]; ok {
			continue
		}
		ids[f.Field()] = struct{}{}
		newFields = append(newFields, f)
	}
	b.p.fields = newFields
	return b
}
