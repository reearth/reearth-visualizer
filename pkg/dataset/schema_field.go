//go:generate go run github.com/reearth/reearth-backend/tools/cmd/idgen --name DatasetSchemaField --output ../id

package dataset

import "github.com/reearth/reearth-backend/pkg/id"

// SchemaField _
type SchemaField struct {
	id       id.DatasetSchemaFieldID
	name     string
	dataType ValueType
	source   Source
	ref      *id.DatasetSchemaID
}

// ID _
func (d *SchemaField) ID() (i id.DatasetSchemaFieldID) {
	if d == nil {
		return
	}
	return d.id
}

// IDRef _
func (d *SchemaField) IDRef() *id.DatasetSchemaFieldID {
	if d == nil {
		return nil
	}
	return d.id.Ref()
}

// Name _
func (d *SchemaField) Name() (n string) {
	if d == nil {
		return
	}
	return d.name
}

// Ref _
func (d *SchemaField) Ref() *id.DatasetSchemaID {
	if d == nil {
		return nil
	}
	return d.ref
}

// Type _
func (d *SchemaField) Type() (v ValueType) {
	if d == nil {
		return
	}
	return d.dataType
}

// Source _
func (d *SchemaField) Source() (s Source) {
	if d == nil {
		return
	}
	return d.source
}
