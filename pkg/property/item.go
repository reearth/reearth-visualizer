package property

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/dataset"
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
	Prune()
	MigrateSchema(context.Context, *Schema, dataset.Loader)
	MigrateDataset(DatasetMigrationParam)
	ValidateSchema(*SchemaGroup) error
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
