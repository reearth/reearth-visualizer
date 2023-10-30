package property

import (
	"github.com/reearth/reearth/server/pkg/i18n"
)

// SchemaGroup represents a group of property that has some fields
type SchemaGroup struct {
	id                  SchemaGroupID
	fields              []*SchemaField
	list                bool
	isAvailableIf       *Condition
	title               i18n.String
	representativeField *FieldID
	collection          i18n.String
}

// ID returns id
func (s *SchemaGroup) ID() SchemaGroupID {
	if s == nil {
		return SchemaGroupID("")
	}
	return s.id
}

func (s *SchemaGroup) IDRef() *SchemaGroupID {
	if s == nil {
		return nil
	}
	return s.id.Ref()
}

// Fields returns a slice of fields
func (s *SchemaGroup) Fields() []*SchemaField {
	if s == nil {
		return nil
	}
	return append([]*SchemaField{}, s.fields...)
}

// Field returns a field whose id is specified
func (s *SchemaGroup) Field(fid FieldID) *SchemaField {
	if s == nil {
		return nil
	}
	for _, f := range s.fields {
		if f.ID() == fid {
			return f
		}
	}
	return nil
}

// FieldByPointer returns a field whose id is specified
func (s *SchemaGroup) FieldByPointer(ptr *Pointer) *SchemaField {
	if s == nil {
		return nil
	}
	fid, ok := ptr.Field()
	if !ok {
		return nil
	}
	return s.Field(fid)
}

func (s *SchemaGroup) HasField(i FieldID) bool {
	return s.Field(i) != nil
}

// IsList returns true if this group is list
func (s *SchemaGroup) IsList() bool {
	if s == nil {
		return false
	}
	return s.list
}

// IsAvailableIf returns condition of availability
func (s *SchemaGroup) IsAvailableIf() *Condition {
	if s == nil {
		return nil
	}
	return s.isAvailableIf.Clone()
}

// Title returns a title of the group
func (s *SchemaGroup) Title() i18n.String {
	if s == nil {
		return nil
	}
	return s.title.Clone()
}

func (s *SchemaGroup) Collection() i18n.String {
	if s == nil {
		return nil
	}
	return s.collection.Clone()
}

// RepresentativeFieldID returns the representative field ID of the group
func (s *SchemaGroup) RepresentativeFieldID() *FieldID {
	if s == nil {
		return nil
	}
	return s.representativeField
}

// RepresentativeField returns the representative field of the group
func (s *SchemaGroup) RepresentativeField() *SchemaField {
	if s == nil || s.representativeField == nil {
		return nil
	}
	return s.Field(*s.representativeField)
}

func (s *SchemaGroup) SetTitle(t i18n.String) {
	s.title = t.Clone()
}
