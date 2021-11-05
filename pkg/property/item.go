package property

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
)

type Item interface {
	ID() id.PropertyItemID
	IDRef() *id.PropertyItemID
	SchemaGroup() id.PropertySchemaGroupID
	SchemaGroupRef() *id.PropertySchemaGroupID
	Schema() id.PropertySchemaID
	SchemaRef() *id.PropertySchemaID
	HasLinkedField() bool
	CollectDatasets() []id.DatasetID
	FieldsByLinkedDataset(id.DatasetSchemaID, id.DatasetID) []*Field
	IsDatasetLinked(id.DatasetSchemaID, id.DatasetID) bool
	IsEmpty() bool
	Prune()
	MigrateSchema(context.Context, *Schema, dataset.Loader)
	MigrateDataset(DatasetMigrationParam)
	ValidateSchema(*SchemaGroup) error
}

type itemBase struct {
	ID          id.PropertyItemID
	Schema      id.PropertySchemaID
	SchemaGroup id.PropertySchemaGroupID
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
