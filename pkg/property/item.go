package property

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
)

// Item _
type Item interface {
	ID() id.PropertyItemID
	IDRef() *id.PropertyItemID
	SchemaGroup() id.PropertySchemaFieldID
	SchemaGroupRef() *id.PropertySchemaFieldID
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
	SchemaGroup id.PropertySchemaFieldID
}

// ToGroup _
func ToGroup(i Item) *Group {
	g, _ := i.(*Group)
	return g
}

// ToGroupList _
func ToGroupList(i Item) *GroupList {
	g, _ := i.(*GroupList)
	return g
}

// InitItemFrom _
func InitItemFrom(psg *SchemaGroup) Item {
	if psg == nil {
		return nil
	}
	if psg.IsList() {
		return InitGroupListFrom(psg)
	}
	return InitGroupFrom(psg)
}
