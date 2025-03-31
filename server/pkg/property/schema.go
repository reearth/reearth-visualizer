package property

import "github.com/reearth/reearth/server/pkg/id"

type Schema struct {
	id       id.PropertySchemaID
	version  int
	groups   *SchemaGroupList
	linkable LinkableFields
}

type LinkableFields struct {
	LatLng *SchemaFieldPointer
	URL    *SchemaFieldPointer
}

func (p *Schema) ID() id.PropertySchemaID {
	return p.id
}

func (p *Schema) IDRef() *id.PropertySchemaID {
	if p == nil {
		return nil
	}
	return p.id.Ref()
}

func (p *Schema) Scene() *id.SceneID {
	return p.id.Plugin().Scene()
}

func (p *Schema) Version() int {
	return p.version
}

func (p *Schema) Groups() *SchemaGroupList {
	if p == nil {
		return nil
	}
	return p.groups
}

func (p *Schema) LinkableFields() LinkableFields {
	if p == nil {
		return LinkableFields{}
	}
	return p.linkable.Clone()
}

func (p LinkableFields) Clone() LinkableFields {
	return LinkableFields{
		LatLng: p.LatLng.Clone(),
		URL:    p.URL.Clone(),
	}
}

func (l LinkableFields) Validate(s *Schema) bool {
	if s == nil {
		return false
	}
	if l.LatLng != nil {
		if f := s.Groups().Field(l.LatLng.Field); f == nil {
			return false
		}
	}
	if l.URL != nil {
		if f := s.Groups().Field(l.URL.Field); f == nil {
			return false
		}
	}
	return true
}

func (l LinkableFields) PointerByType(ty ValueType) *SchemaFieldPointer {
	switch ty {
	case ValueTypeLatLng:
		return l.LatLng
	case ValueTypeURL:
		return l.URL
	}
	return nil
}

func (l LinkableFields) FieldByType(ty ValueType) *id.PropertyFieldID {
	p := l.PointerByType(ty)
	if p == nil {
		return nil
	}
	return p.Field.Ref()
}
