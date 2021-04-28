package property

import "github.com/reearth/reearth-backend/pkg/id"

// GroupBuilder _
type GroupBuilder struct {
	p *Group
}

// NewGroup _
func NewGroup() *GroupBuilder {
	return &GroupBuilder{
		p: &Group{},
	}
}

// InitGroupFrom _
func InitGroupFrom(g *SchemaGroup) *Group {
	if g == nil {
		return nil
	}
	g2, _ := NewGroup().NewID().Schema(g.Schema(), g.ID()).Build()
	return g2
}

// Build _
func (b *GroupBuilder) Build() (*Group, error) {
	if id.ID(b.p.itemBase.ID).IsNil() {
		return nil, id.ErrInvalidID
	}
	return b.p, nil
}

// MustBuild _
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

// ID _
func (b *GroupBuilder) ID(id id.PropertyItemID) *GroupBuilder {
	b.p.itemBase.ID = id
	return b
}

// NewID _
func (b *GroupBuilder) NewID() *GroupBuilder {
	b.p.itemBase.ID = id.NewPropertyItemID()
	return b
}

// Schema _
func (b *GroupBuilder) Schema(s id.PropertySchemaID, g id.PropertySchemaFieldID) *GroupBuilder {
	b.p.itemBase.Schema = s
	b.p.itemBase.SchemaGroup = g
	return b
}

// Fields _
func (b *GroupBuilder) Fields(fields []*Field) *GroupBuilder {
	var newFields []*Field
	ids := map[id.PropertySchemaFieldID]struct{}{}
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
