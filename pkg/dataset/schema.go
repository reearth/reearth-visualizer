package dataset

import "github.com/reearth/reearth-backend/pkg/id"

type Schema struct {
	id                  id.DatasetSchemaID
	source              string
	name                string
	fields              map[id.DatasetSchemaFieldID]*SchemaField
	order               []id.DatasetSchemaFieldID
	representativeField *id.DatasetSchemaFieldID
	scene               id.SceneID
	dynamic             bool
}

func (d *Schema) ID() (i id.DatasetSchemaID) {
	if d == nil {
		return
	}
	return d.id
}

func (d *Schema) IDRef() *id.DatasetSchemaID {
	if d == nil {
		return nil
	}
	return d.id.Ref()
}

func (d *Schema) Scene() (i id.SceneID) {
	if d == nil {
		return
	}
	return d.scene
}

func (d *Schema) Source() (s string) {
	if d == nil {
		return
	}
	return d.source
}

func (d *Schema) Name() string {
	if d == nil {
		return ""
	}
	return d.name
}

func (d *Schema) RepresentativeFieldID() *id.DatasetSchemaFieldID {
	if d == nil {
		return nil
	}
	return d.representativeField
}

func (d *Schema) RepresentativeField() *SchemaField {
	if d == nil || d.representativeField == nil {
		return nil
	}
	return d.fields[*d.representativeField]
}

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

func (d *Schema) Field(id id.DatasetSchemaFieldID) *SchemaField {
	if d == nil {
		return nil
	}
	return d.fields[id]
}

func (d *Schema) FieldRef(id *id.DatasetSchemaFieldID) *SchemaField {
	if d == nil || id == nil {
		return nil
	}
	return d.fields[*id]
}

func (d *Schema) FieldBySource(source string) *SchemaField {
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
