package dataset

import "fmt"

type SchemaField struct {
	id       FieldID
	name     string
	dataType ValueType
	source   string
	ref      *SchemaID
}

func (d *SchemaField) ID() (i FieldID) {
	if d == nil {
		return
	}
	return d.id
}

func (d *SchemaField) IDRef() *FieldID {
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

func (d *SchemaField) Ref() *SchemaID {
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

func (d *SchemaField) Clone() *SchemaField {
	if d == nil {
		return nil
	}
	return &SchemaField{
		id:       d.id,
		name:     d.name,
		dataType: d.dataType,
		source:   d.source,
		ref:      d.ref.CloneRef(),
	}
}

// JSONSchema prints a JSON schema for the schema field.
func (d *SchemaField) JSONSchema() map[string]any {
	if d == nil {
		return nil
	}

	s := d.dataType.JSONSchema()
	s["$id"] = fmt.Sprintf("#/properties/%s", d.ID())
	return s
}
