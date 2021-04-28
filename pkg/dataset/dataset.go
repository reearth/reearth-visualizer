package dataset

import "github.com/reearth/reearth-backend/pkg/id"

// Dataset _
type Dataset struct {
	id     id.DatasetID
	source Source
	schema id.DatasetSchemaID
	fields map[id.DatasetSchemaFieldID]*Field
	order  []id.DatasetSchemaFieldID
	scene  id.SceneID
}

// ID _
func (d *Dataset) ID() (i id.DatasetID) {
	if d == nil {
		return
	}
	return d.id
}

// Scene _
func (d *Dataset) Scene() (i id.SceneID) {
	if d == nil {
		return
	}
	return d.scene
}

// Source _
func (d *Dataset) Source() (i Source) {
	if d == nil {
		return
	}
	return d.source
}

// Schema _
func (d *Dataset) Schema() (i id.DatasetSchemaID) {
	if d == nil {
		return
	}
	return d.schema
}

// Fields _
func (d *Dataset) Fields() []*Field {
	if d == nil || d.order == nil {
		return nil
	}
	fields := make([]*Field, 0, len(d.fields))
	for _, id := range d.order {
		fields = append(fields, d.fields[id])
	}
	return fields
}

// Field _
func (d *Dataset) Field(id id.DatasetSchemaFieldID) *Field {
	if d == nil || d.fields == nil {
		return nil
	}
	return d.fields[id]
}

// FieldRef _
func (d *Dataset) FieldRef(id *id.DatasetSchemaFieldID) *Field {
	if d == nil || id == nil {
		return nil
	}
	return d.fields[*id]
}

// NameField _
func (d *Dataset) NameField(ds *Schema) *Field {
	if d == nil {
		return nil
	}
	if d.Schema() != ds.ID() {
		return nil
	}
	f := ds.RepresentativeField()
	if f == nil {
		return nil
	}
	return d.fields[f.ID()]
}

// FieldBySource _
func (d *Dataset) FieldBySource(source Source) *Field {
	if d == nil {
		return nil
	}
	for _, f := range d.fields {
		if f.source == source {
			return f
		}
	}
	return nil
}

// FieldByType _
func (d *Dataset) FieldByType(t ValueType) *Field {
	if d == nil {
		return nil
	}
	for _, f := range d.fields {
		if f.Type() == t {
			return f
		}
	}
	return nil
}
