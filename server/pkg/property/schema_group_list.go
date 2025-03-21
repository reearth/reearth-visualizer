package property

import "github.com/reearth/reearth/server/pkg/id"

type SchemaGroupList struct {
	groups []*SchemaGroup
}

func NewSchemaGroupList(p []*SchemaGroup) *SchemaGroupList {
	sgl := &SchemaGroupList{
		groups: append(p[:0:0], p...),
	}
	if len(sgl.duplicatedGroups()) > 0 {
		return nil
	}
	return sgl
}

func (p *SchemaGroupList) Len() int {
	if p == nil {
		return 0
	}
	return len(p.groups)
}

func (p *SchemaGroupList) Groups() []*SchemaGroup {
	if p == nil {
		return nil
	}
	return append(p.groups[:0:0], p.groups...)
}

func (p *SchemaGroupList) Fields() []*SchemaField {
	if p == nil {
		return nil
	}

	fields := []*SchemaField{}
	for _, g := range p.groups {
		fields = append(fields, g.Fields()...)
	}
	return fields
}

func (p *SchemaGroupList) GroupAndFields() []SchemaGroupAndField {
	if p == nil {
		return nil
	}
	fields := []SchemaGroupAndField{}
	for _, g := range p.groups {
		for _, f := range g.Fields() {
			fields = append(fields, SchemaGroupAndField{Group: g, Field: f})
		}
	}
	return fields
}

func (p *SchemaGroupList) Field(id id.PropertyFieldID) *SchemaField {
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

func (p *SchemaGroupList) Group(id id.PropertySchemaGroupID) *SchemaGroup {
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

func (p *SchemaGroupList) GroupByField(id id.PropertyFieldID) *SchemaGroup {
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

func (p *SchemaGroupList) GroupAndField(f id.PropertyFieldID) *SchemaGroupAndField {
	if p == nil {
		return nil
	}
	for _, g := range p.groups {
		if gf := g.Field(f); gf != nil {
			return &SchemaGroupAndField{Group: g, Field: gf}
		}
	}
	return nil
}

func (s *SchemaGroupList) duplicatedGroups() []id.PropertySchemaGroupID {
	if s == nil {
		return nil
	}

	var duplicated []id.PropertySchemaGroupID
	ids := map[id.PropertySchemaGroupID]struct{}{}
	for _, f := range s.Groups() {
		i := f.ID()
		if _, ok := ids[i]; ok {
			duplicated = append(duplicated, i)
		}
		ids[i] = struct{}{}
	}
	return duplicated
}

type SchemaGroupAndField struct {
	Group *SchemaGroup
	Field *SchemaField
}

func (gf SchemaGroupAndField) IsEmpty() bool {
	return gf.Group == nil && gf.Field == nil
}

func (gf SchemaGroupAndField) Pointer() *Pointer {
	if gf.Group == nil && gf.Field == nil {
		return nil
	}
	return NewPointer(gf.Group.ID().Ref(), nil, gf.Field.ID().Ref())
}

func (f SchemaGroupAndField) SchemaFieldPointer() SchemaFieldPointer {
	return SchemaFieldPointer{
		SchemaGroup: f.Group.ID(),
		Field:       f.Field.ID(),
	}
}
