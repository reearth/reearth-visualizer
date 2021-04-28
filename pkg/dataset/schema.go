package dataset

import "github.com/reearth/reearth-backend/pkg/id"

// Schema _
type Schema struct {
	id                  id.DatasetSchemaID
	source              Source
	name                string
	fields              map[id.DatasetSchemaFieldID]*SchemaField
	order               []id.DatasetSchemaFieldID
	representativeField *id.DatasetSchemaFieldID
	scene               id.SceneID
	dynamic             bool
}

// ID _
func (d *Schema) ID() (i id.DatasetSchemaID) {
	if d == nil {
		return
	}
	return d.id
}

// IDRef _
func (d *Schema) IDRef() *id.DatasetSchemaID {
	if d == nil {
		return nil
	}
	return d.id.Ref()
}

// Scene _
func (d *Schema) Scene() (i id.SceneID) {
	if d == nil {
		return
	}
	return d.scene
}

// Source _
func (d *Schema) Source() (s Source) {
	if d == nil {
		return
	}
	return d.source
}

// Name _
func (d *Schema) Name() string {
	if d == nil {
		return ""
	}
	return d.name
}

// RepresentativeFieldID _
func (d *Schema) RepresentativeFieldID() *id.DatasetSchemaFieldID {
	if d == nil {
		return nil
	}
	return d.representativeField
}

// RepresentativeField _
func (d *Schema) RepresentativeField() *SchemaField {
	if d == nil || d.representativeField == nil {
		return nil
	}
	return d.fields[*d.representativeField]
}

// Fields _
func (d *Schema) Fields() []*SchemaField {
	if d == nil || d.order == nil {
		return nil
	}
	fields := make([]*SchemaField, 0, len(d.fields))
	for _, id := range d.order {
		fields = append(fields, d.fields[id])
	}
	return fields
}

// Field _
func (d *Schema) Field(id id.DatasetSchemaFieldID) *SchemaField {
	if d == nil {
		return nil
	}
	return d.fields[id]
}

// FieldRef _
func (d *Schema) FieldRef(id *id.DatasetSchemaFieldID) *SchemaField {
	if d == nil || id == nil {
		return nil
	}
	return d.fields[*id]
}

// FieldBySource _
func (d *Schema) FieldBySource(source Source) *SchemaField {
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
func (d *Schema) FieldByType(t ValueType) *SchemaField {
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

// Dynamic _
func (d *Schema) Dynamic() bool {
	return d.dynamic
}

// Rename _
func (u *Schema) Rename(name string) {
	u.name = name
}
