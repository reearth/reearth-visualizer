package dataset

type Dataset struct {
	id     ID
	source string
	schema SchemaID
	fields map[FieldID]*Field
	order  []FieldID
	scene  SceneID
}

func (d *Dataset) ID() (i ID) {
	if d == nil {
		return
	}
	return d.id
}

func (d *Dataset) Scene() (i SceneID) {
	if d == nil {
		return
	}
	return d.scene
}

func (d *Dataset) Source() string {
	if d == nil {
		return ""
	}
	return d.source
}

func (d *Dataset) Schema() (i SchemaID) {
	if d == nil {
		return
	}
	return d.schema
}

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

func (d *Dataset) Field(id FieldID) *Field {
	if d == nil || d.fields == nil {
		return nil
	}
	return d.fields[id]
}

func (d *Dataset) AddField(f *Field) {
	if d == nil || f == nil {
		return
	}
	if d.fields == nil {
		d.fields = map[FieldID]*Field{}
	}
	d.fields[f.Field()] = f
	d.order = append(d.order, f.Field())
}

func (d *Dataset) FieldRef(id *FieldID) *Field {
	if d == nil || id == nil {
		return nil
	}
	return d.fields[*id]
}

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

func (d *Dataset) FieldBySource(source string) *Field {
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

// Interface returns a simple and human-readable representation of the dataset
func (d *Dataset) Interface(s *Schema, idkey string) map[string]interface{} {
	if d == nil || s == nil || d.Schema() != s.ID() {
		return nil
	}
	m := map[string]interface{}{}
	m[idkey] = d.ID().String()
	for _, f := range d.fields {
		key := s.Field(f.Field()).Name()
		if key == "" {
			key = f.Field().String()
		}
		if key == "" {
			continue
		}
		m[key] = f.Value().Interface()
	}
	return m
}

// Interface is almost same as Interface, but keys of the map are IDs of fields.
func (d *Dataset) InterfaceWithFieldIDs(idkey string) map[string]interface{} {
	if d == nil {
		return nil
	}
	m := map[string]interface{}{}
	if !d.ID().IsEmpty() {
		m[idkey] = d.ID().String()
	}
	for _, f := range d.fields {
		key := f.Field().String()
		m[key] = f.Value().Interface()
	}
	return m
}

// AddOrReplaceField adds or replaces a field in the dataset.
func (d *Dataset) AddOrReplaceField(f *Field) {
	if d == nil || f == nil {
		return
	}
	if d.fields == nil {
		d.fields = map[FieldID]*Field{}
	}
	id := f.Field()
	// Nếu chưa có field này trong order, thêm vào
	exists := false
	for _, fid := range d.order {
		if fid == id {
			exists = true
			break
		}
	}
	if !exists {
		d.order = append(d.order, id)
	}
	d.fields[id] = f
}

// SetFieldsFrom replaces or merges fields from another dataset.
func (d *Dataset) SetFieldsFrom(src *Dataset) {
	if d == nil || src == nil {
		return
	}
	if d.fields == nil {
		d.fields = map[FieldID]*Field{}
	}
	for _, f := range src.Fields() {
		if f == nil {
			continue
		}
		id := f.Field()
		// nếu chưa có field này trong order thì thêm mới
		exists := false
		for _, fid := range d.order {
			if fid == id {
				exists = true
				break
			}
		}
		if !exists {
			d.order = append(d.order, id)
		}
		d.fields[id] = f
	}
}
