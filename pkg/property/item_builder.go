package property

import "github.com/reearth/reearth-backend/pkg/id"

type ItemBuilder struct {
	base itemBase
}

func NewItem() *ItemBuilder {
	return &ItemBuilder{}
}

func (b *ItemBuilder) Group() *GroupBuilder {
	return NewGroup().base(b.base)
}

func (b *ItemBuilder) GroupList() *GroupListBuilder {
	return NewGroupList().base(b.base)
}

func (b *ItemBuilder) ID(id id.PropertyItemID) *ItemBuilder {
	b.base.ID = id
	return b
}

func (b *ItemBuilder) NewID() *ItemBuilder {
	b.base.ID = id.NewPropertyItemID()
	return b
}

func (b *ItemBuilder) Schema(s id.PropertySchemaID, g id.PropertySchemaFieldID) *ItemBuilder {
	b.base.Schema = s
	b.base.SchemaGroup = g
	return b
}
