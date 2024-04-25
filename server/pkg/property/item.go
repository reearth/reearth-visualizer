package property

import (
	"context"

	"github.com/reearth/reearth/server/pkg/dataset"
)

type Item interface {
	ID() ItemID
	IDRef() *ItemID
	SchemaGroup() SchemaGroupID
	SchemaGroupRef() *SchemaGroupID
	HasLinkedField() bool
	Datasets() []DatasetID
	FieldsByLinkedDataset(DatasetSchemaID, DatasetID) []*Field
	IsDatasetLinked(DatasetSchemaID, DatasetID) bool
	IsEmpty() bool
	Prune() bool
	MigrateSchema(context.Context, *Schema, dataset.Loader)
	MigrateDataset(DatasetMigrationParam)
	ValidateSchema(*SchemaGroup) error
	Fields(*Pointer) []*Field
	RemoveFields(*Pointer) bool
	CloneItem() Item
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
