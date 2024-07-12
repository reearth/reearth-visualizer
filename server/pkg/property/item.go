package property

import (
	"context"
)

type Item interface {
	ID() ItemID
	IDRef() *ItemID
	SchemaGroup() SchemaGroupID
	SchemaGroupRef() *SchemaGroupID
	IsEmpty() bool
	Prune() bool
	MigrateSchema(context.Context, *Schema)
	ValidateSchema(*SchemaGroup) error
	Fields(*Pointer) []*Field
	RemoveFields(*Pointer) bool
	GroupAndFields(*Pointer) []GroupAndField
	GuessSchema() *SchemaGroup
}

type itemBase struct {
	ID          ItemID
	SchemaGroup SchemaGroupID
}

func ToGroup(i Item) *Group {
	g, _ := i.(*Group)
	return g
}

func ToGroupList(i Item) *GroupList {
	g, _ := i.(*GroupList)
	return g
}

func InitItemFrom(psg *SchemaGroup) Item {
	if psg == nil {
		return nil
	}
	if psg.IsList() {
		return InitGroupListFrom(psg)
	}
	return InitGroupFrom(psg)
}

type GroupAndField struct {
	ParentGroup *GroupList
	Group       *Group
	Field       *Field
}

func (f GroupAndField) SchemaFieldPointer() SchemaFieldPointer {
	return SchemaFieldPointer{
		SchemaGroup: f.Group.SchemaGroup(),
		Field:       f.Field.Field(),
	}
}
