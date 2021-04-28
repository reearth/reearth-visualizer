package property

import "github.com/reearth/reearth-backend/pkg/id"

// Schema _
type Schema struct {
	id       id.PropertySchemaID
	version  int
	groups   []*SchemaGroup
	linkable LinkableFields
}

// LinkableFields _
type LinkableFields struct {
	LatLng *Pointer
	URL    *Pointer
}

// ID _
func (p *Schema) ID() id.PropertySchemaID {
	return p.id
}

// IDRef _
func (p *Schema) IDRef() *id.PropertySchemaID {
	if p == nil {
		return nil
	}
	return p.id.Ref()
}

// Version _
func (p *Schema) Version() int {
	return p.version
}

// Fields _
func (p *Schema) Fields() []*SchemaField {
	if p == nil {
		return nil
	}
	fields := []*SchemaField{}
	for _, g := range p.groups {
		fields = append(fields, g.Fields()...)
	}
	return fields
}

// Field _
func (p *Schema) Field(id id.PropertySchemaFieldID) *SchemaField {
	if p == nil {
		return nil
	}
	for _, g := range p.groups {
		if f := g.Field(id); f != nil {
			return f
		}
	}
	return nil
}

// FieldByPointer _
func (p *Schema) FieldByPointer(ptr *Pointer) *SchemaField {
	if p == nil {
		return nil
	}
	g := p.GroupByPointer(ptr)
	if g == nil {
		return nil
	}
	return g.FieldByPointer(ptr)
}

// Groups _
func (p *Schema) Groups() []*SchemaGroup {
	if p == nil {
		return nil
	}
	return append([]*SchemaGroup{}, p.groups...)
}

// Group _
func (p *Schema) Group(id id.PropertySchemaFieldID) *SchemaGroup {
	if p == nil {
		return nil
	}
	for _, f := range p.groups {
		if f.ID() == id {
			return f
		}
	}
	return nil
}

// GroupByField _
func (p *Schema) GroupByField(id id.PropertySchemaFieldID) *SchemaGroup {
	if p == nil {
		return nil
	}
	for _, f := range p.groups {
		if f.HasField(id) {
			return f
		}
	}
	return nil
}

// GroupByPointer _
func (p *Schema) GroupByPointer(ptr *Pointer) *SchemaGroup {
	if p == nil {
		return nil
	}

	if gid, ok := ptr.ItemBySchemaGroup(); ok {
		return p.Group(gid)
	}
	if fid, ok := ptr.Field(); ok {
		for _, g := range p.groups {
			if g.HasField(fid) {
				return g
			}
		}
	}

	return nil
}

// DetectDuplicatedFields _
func (s *Schema) DetectDuplicatedFields() []id.PropertySchemaFieldID {
	duplicated := []id.PropertySchemaFieldID{}
	ids := map[id.PropertySchemaFieldID]struct{}{}
	for _, f := range s.Fields() {
		i := f.ID()
		if _, ok := ids[i]; ok {
			duplicated = append(duplicated, i)
			return duplicated
		}
		ids[i] = struct{}{}
	}
	return nil
}

// LinkableFields _
func (p *Schema) LinkableFields() LinkableFields {
	if p == nil {
		return LinkableFields{}
	}
	return p.linkable.Clone()
}

// Clone _
func (l LinkableFields) Clone() LinkableFields {
	return LinkableFields{
		LatLng: l.LatLng.Clone(),
		URL:    l.URL.Clone(),
	}
}

// Validate _
func (l LinkableFields) Validate(s *Schema) bool {
	if s == nil {
		return false
	}
	if l.LatLng != nil {
		if f := s.FieldByPointer(l.LatLng); f == nil {
			return false
		}
	}
	if l.URL != nil {
		if f := s.FieldByPointer(l.URL); f == nil {
			return false
		}
	}
	return true
}
