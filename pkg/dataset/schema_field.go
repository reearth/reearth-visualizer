package dataset

import "github.com/reearth/reearth-backend/pkg/id"

type SchemaField struct {
	id       id.DatasetSchemaFieldID
	name     string
	dataType ValueType
	source   string
	ref      *id.DatasetSchemaID
}

func (d *SchemaField) ID() (i id.DatasetSchemaFieldID) {
	if d == nil {
		return
	}
	return d.id
}

func (d *SchemaField) IDRef() *id.DatasetSchemaFieldID {
	if d == nil {
		return nil
	}
	return d.id.Ref()
}

func (d *SchemaField) Name() (n string) {
	if d == nil {
		return
	}
	return d.name
}

func (d *SchemaField) Ref() *id.DatasetSchemaID {
	if d == nil {
		return nil
	}
	return d.ref
}

func (d *SchemaField) Type() (v ValueType) {
	if d == nil {
		return
	}
	return d.dataType
}

func (d *SchemaField) Source() (s string) {
	if d == nil {
		return
	}
	return d.source
}
