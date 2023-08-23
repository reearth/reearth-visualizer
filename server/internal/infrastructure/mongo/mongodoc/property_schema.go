package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"golang.org/x/exp/slices"
)

type PropertySchemaDocument struct {
	ID             string
	Scene          *string `bson:",omitempty"`
	Version        int
	Groups         []*PropertySchemaGroupDocument
	LinkableFields *PropertyLinkableFieldsDocument
}

type PropertySchemaGroupDocument struct {
	ID                    string
	Fields                []*PropertySchemaFieldDocument
	List                  bool
	IsAvailableIf         *PropertyConditonDocument
	Title                 map[string]string
	RepresentativeFieldID *string `bson:",omitempty"`
}

type PropertySchemaFieldDocument struct {
	ID            string
	Type          string
	Name          map[string]string
	Description   map[string]string
	Prefix        string
	Suffix        string
	DefaultValue  interface{}
	UI            *string
	Min           *float64
	Max           *float64
	Choices       []PropertySchemaFieldChoiceDocument
	IsAvailableIf *PropertyConditonDocument `bson:",omitempty"`
}

type PropertySchemaFieldChoiceDocument struct {
	Key   string
	Label map[string]string
}

type PropertyLinkableFieldsDocument struct {
	LatLng *PropertySchemaFieldPointerDocument
	URL    *PropertySchemaFieldPointerDocument
}

type PropertySchemaFieldPointerDocument struct {
	SchemaGroupID string
	FieldID       string
}

type PropertyConditonDocument struct {
	Field string
	Type  string
	Value interface{}
}

type PropertySchemaConsumer = Consumer[*PropertySchemaDocument, *property.Schema]

func NewPropertySchemaConsumer(scenes []id.SceneID) *PropertySchemaConsumer {
	return NewConsumer[*PropertySchemaDocument, *property.Schema](func(a *property.Schema) bool {
		sid := a.ID().Plugin().Scene()
		return sid == nil || scenes == nil || slices.Contains(scenes, *sid)
	})
}

func NewPropertySchemaField(f *property.SchemaField) *PropertySchemaFieldDocument {
	if f == nil {
		return nil
	}

	field := &PropertySchemaFieldDocument{
		ID:            string(f.ID()),
		Name:          f.Title(),
		Suffix:        f.Suffix(),
		Prefix:        f.Prefix(),
		Description:   f.Description(),
		Type:          string(f.Type()),
		DefaultValue:  f.DefaultValue().Value(),
		UI:            f.UI().StringRef(),
		Min:           f.Min(),
		Max:           f.Max(),
		IsAvailableIf: newPropertyCondition(f.IsAvailableIf()),
	}
	if choices := f.Choices(); choices != nil {
		field.Choices = make([]PropertySchemaFieldChoiceDocument, 0, len(choices))
		for _, c := range choices {
			field.Choices = append(field.Choices, PropertySchemaFieldChoiceDocument{
				Key:   c.Key,
				Label: c.Title,
			})
		}
	}
	return field
}

func NewPropertySchema(m *property.Schema) (*PropertySchemaDocument, string) {
	if m == nil {
		return nil, ""
	}

	pgroups := m.Groups().Groups()
	groups := make([]*PropertySchemaGroupDocument, 0, len(pgroups))
	for _, f := range pgroups {
		groups = append(groups, newPropertySchemaGroup(f))
	}

	id := m.ID().String()
	return &PropertySchemaDocument{
		ID:             id,
		Scene:          m.Scene().StringRef(),
		Version:        m.Version(),
		Groups:         groups,
		LinkableFields: ToDocPropertyLinkableFields(m.LinkableFields()),
	}, id
}

func NewPropertySchemas(ps []*property.Schema, f scene.IDList) ([]interface{}, []string) {
	if ps == nil {
		return nil, nil
	}

	res := make([]interface{}, 0, len(ps))
	ids := make([]string, 0, len(ps))
	for _, d := range ps {
		if d == nil {
			continue
		}
		if s := d.Scene(); s != nil && f != nil && !f.Has(*s) {
			continue
		}
		r, id := NewPropertySchema(d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

func ToModelPropertySchemaField(f *PropertySchemaFieldDocument) (*property.SchemaField, error) {
	if f == nil {
		return nil, nil
	}

	var choices []property.SchemaFieldChoice
	if f.Choices != nil {
		choices = make([]property.SchemaFieldChoice, 0, len(f.Choices))
		for _, c := range f.Choices {
			choices = append(choices, property.SchemaFieldChoice{
				Key:   c.Key,
				Title: c.Label,
			})
		}
	}

	vt := property.ValueType(f.Type)
	return property.NewSchemaField().
		ID(id.PropertyFieldID(f.ID)).
		Type(vt).
		Name(f.Name).
		Description(f.Description).
		Prefix(f.Prefix).
		Suffix(f.Suffix).
		DefaultValue(vt.ValueFrom(f.DefaultValue)).
		UIRef(property.SchemaFieldUIFromRef(f.UI)).
		MinRef(f.Min).
		MaxRef(f.Max).
		Choices(choices).
		IsAvailableIf(toModelPropertyCondition(f.IsAvailableIf)).
		Build()
}

func (doc *PropertySchemaDocument) Model() (*property.Schema, error) {
	if doc == nil {
		return nil, nil
	}

	pid, err := id.PropertySchemaIDFrom(doc.ID)
	if err != nil {
		return nil, err
	}

	groups := make([]*property.SchemaGroup, 0, len(doc.Groups))
	for _, g := range doc.Groups {
		g2, err := g.Model()
		if err != nil {
			return nil, err
		}
		groups = append(groups, g2)
	}

	return property.NewSchema().
		ID(pid).
		Version(doc.Version).
		Groups(property.NewSchemaGroupList(groups)).
		LinkableFields(toModelPropertyLinkableFields(doc.LinkableFields)).
		Build()
}

func newPropertyCondition(c *property.Condition) *PropertyConditonDocument {
	if c == nil {
		return nil
	}

	return &PropertyConditonDocument{
		Field: string(c.Field),
		Type:  string(c.Value.Type()),
		Value: c.Value.Interface(),
	}
}

func toModelPropertyCondition(d *PropertyConditonDocument) *property.Condition {
	if d == nil {
		return nil
	}

	return &property.Condition{
		Field: id.PropertyFieldID(d.Field),
		Value: toModelPropertyValue(d.Value, d.Type),
	}
}

func newPropertySchemaGroup(p *property.SchemaGroup) *PropertySchemaGroupDocument {
	if p == nil {
		return nil
	}

	pfields := p.Fields()
	fields := make([]*PropertySchemaFieldDocument, 0, len(pfields))
	for _, f := range pfields {
		fields = append(fields, NewPropertySchemaField(f))
	}

	return &PropertySchemaGroupDocument{
		ID:                    string(p.ID()),
		List:                  p.IsList(),
		IsAvailableIf:         newPropertyCondition(p.IsAvailableIf()),
		Title:                 p.Title(),
		RepresentativeFieldID: p.RepresentativeFieldID().StringRef(),
		Fields:                fields,
	}
}

func (d *PropertySchemaGroupDocument) Model() (*property.SchemaGroup, error) {
	if d == nil {
		return nil, nil
	}

	fields := make([]*property.SchemaField, 0, len(d.Fields))
	for _, f := range d.Fields {
		field, err := ToModelPropertySchemaField(f)
		if err != nil {
			return nil, err
		}
		fields = append(fields, field)
	}

	return property.NewSchemaGroup().
		ID(id.PropertySchemaGroupID(d.ID)).
		IsList(d.List).
		Title(d.Title).
		IsAvailableIf(toModelPropertyCondition(d.IsAvailableIf)).
		Fields(fields).
		RepresentativeField(id.PropertyFieldIDFromRef(d.RepresentativeFieldID)).
		Build()
}

func ToDocPropertyLinkableFields(l property.LinkableFields) *PropertyLinkableFieldsDocument {
	return &PropertyLinkableFieldsDocument{
		LatLng: newDocPropertyPointer(l.LatLng),
		URL:    newDocPropertyPointer(l.URL),
	}
}

func toModelPropertyLinkableFields(l *PropertyLinkableFieldsDocument) property.LinkableFields {
	if l == nil {
		return property.LinkableFields{}
	}
	return property.LinkableFields{
		LatLng: toModelPropertyPointer(l.LatLng),
		URL:    toModelPropertyPointer(l.URL),
	}
}

func toModelPropertyPointer(p *PropertySchemaFieldPointerDocument) *property.SchemaFieldPointer {
	if p == nil {
		return nil
	}
	return &property.SchemaFieldPointer{
		SchemaGroup: property.SchemaGroupID(p.SchemaGroupID),
		Field:       property.FieldID(p.FieldID),
	}
}

func newDocPropertyPointer(p *property.SchemaFieldPointer) *PropertySchemaFieldPointerDocument {
	if p == nil {
		return nil
	}
	return &PropertySchemaFieldPointerDocument{
		SchemaGroupID: p.SchemaGroup.String(),
		FieldID:       p.Field.String(),
	}
}
