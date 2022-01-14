package property

type Schema struct {
	id       SchemaID
	version  int
	groups   []*SchemaGroup
	linkable LinkableFields
}

type LinkableFields struct {
	LatLng *Pointer
	URL    *Pointer
}

func (p *Schema) ID() SchemaID {
	return p.id
}

func (p *Schema) IDRef() *SchemaID {
	if p == nil {
		return nil
	}
	return p.id.Ref()
}

func (p *Schema) Version() int {
	return p.version
}

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

func (p *Schema) Field(id FieldID) *SchemaField {
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

func (p *Schema) Groups() []*SchemaGroup {
	if p == nil {
		return nil
	}
	return append([]*SchemaGroup{}, p.groups...)
}

func (p *Schema) Group(id SchemaGroupID) *SchemaGroup {
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

func (p *Schema) GroupByField(id FieldID) *SchemaGroup {
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

func (s *Schema) DetectDuplicatedFields() []FieldID {
	duplicated := []FieldID{}
	ids := map[FieldID]struct{}{}
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

func (p *Schema) LinkableFields() LinkableFields {
	if p == nil {
		return LinkableFields{}
	}
	return p.linkable.Clone()
}

func (l LinkableFields) Clone() LinkableFields {
	return LinkableFields{
		LatLng: l.LatLng.Clone(),
		URL:    l.URL.Clone(),
	}
}

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
