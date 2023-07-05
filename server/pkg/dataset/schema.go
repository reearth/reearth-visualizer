package dataset

import "fmt"

type Schema struct {
	id                  SchemaID
	source              string
	name                string
	fields              map[FieldID]*SchemaField
	order               []FieldID
	representativeField *FieldID
	scene               SceneID
}

func (d *Schema) ID() (i SchemaID) {
	if d == nil {
		return
	}
	return d.id
}

func (d *Schema) IDRef() *SchemaID {
	if d == nil {
		return nil
	}
	return d.id.Ref()
}

func (d *Schema) Scene() (i SceneID) {
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

func (d *Schema) RepresentativeFieldID() *FieldID {
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

func (d *Schema) Field(id FieldID) *SchemaField {
	if d == nil {
		return nil
	}
	return d.fields[id]
}

func (d *Schema) FieldRef(id *FieldID) *SchemaField {
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

func (u *Schema) Rename(name string) {
	u.name = name
}

// JSONSchema prints a JSON schema for the schema
func (d *Schema) JSONSchema() map[string]any {
	if d == nil {
		return nil
	}

	properties := map[string]any{
		"": map[string]any{
			"title": "ID",
			"type":  "string",
			"$id":   "#/properties/id",
		},
	}
	for _, f := range d.fields {
		name := f.Name()
		if name == "" {
			name = f.ID().String()
		}
		if name == "" {
			continue
		}
		properties[name] = f.JSONSchema()
	}

	m := map[string]any{
		"$schema":    "http://json-schema.org/draft-07/schema#",
		"$id":        fmt.Sprintf("#/schemas/%s", d.ID()),
		"title":      d.name,
		"type":       "object",
		"properties": properties,
	}
	return m
}
