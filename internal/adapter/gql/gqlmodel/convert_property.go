package gqlmodel

import (
	"strings"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/value"
)

func ToPropertyValue(v *property.Value) *interface{} {
	var res interface{}
	if v == nil {
		return nil
	}
	switch v2 := v.Value().(type) {
	case property.Camera:
		res = Camera{
			Lat:      v2.Lat,
			Lng:      v2.Lng,
			Altitude: v2.Altitude,
			Heading:  v2.Heading,
			Pitch:    v2.Pitch,
			Roll:     v2.Roll,
			Fov:      v2.FOV,
		}
	case property.Typography:
		res = Typography{
			FontFamily: v2.FontFamily,
			FontSize:   v2.FontSize,
			FontWeight: v2.FontWeight,
			Color:      v2.Color,
			TextAlign:  ToTextAlign(v2.TextAlign),
			Bold:       v2.Bold,
			Italic:     v2.Italic,
			Underline:  v2.Underline,
		}
	default:
		res = valueInterfaceToGqlValue(v2)
	}
	return &res
}

func ToTextAlign(t *property.TextAlign) *TextAlign {
	if t == nil {
		return nil
	}
	var t3 TextAlign
	switch *t {
	case property.TextAlignLeft:
		t3 = TextAlignLeft
	case property.TextAlignCenter:
		t3 = TextAlignCenter
	case property.TextAlignRight:
		t3 = TextAlignRight
	case property.TextAlignJustify:
		t3 = TextAlignJustify
	case property.TextAlignJustifyAll:
		t3 = TextAlignJustifyAll
	default:
		return nil
	}
	return &t3
}

func FromPropertyValueAndType(v interface{}, t ValueType) *property.Value {
	switch v2 := v.(type) {
	case *Camera:
		v = property.Camera{
			Lat:      v2.Lat,
			Lng:      v2.Lng,
			Altitude: v2.Altitude,
			Heading:  v2.Heading,
			Pitch:    v2.Pitch,
			Roll:     v2.Roll,
			FOV:      v2.Fov,
		}
	case *Typography:
		v = property.Typography{
			FontFamily: v2.FontFamily,
			FontSize:   v2.FontSize,
			FontWeight: v2.FontWeight,
			Color:      v2.Color,
			TextAlign:  fromTextAlign(v2.TextAlign),
			Bold:       v2.Bold,
			Italic:     v2.Italic,
			Underline:  v2.Underline,
		}
	default:
		v = gqlValueToValueInterface(v2)
	}
	return property.ValueType(FromValueType(t)).ValueFrom(v)
}

func fromTextAlign(t *TextAlign) *property.TextAlign {
	if t == nil {
		return nil
	}
	var t2 property.TextAlign
	switch *t {
	case TextAlignLeft:
		t2 = property.TextAlignLeft
	case TextAlignCenter:
		t2 = property.TextAlignCenter
	case TextAlignRight:
		t2 = property.TextAlignRight
	case TextAlignJustify:
		t2 = property.TextAlignJustify
	case TextAlignJustifyAll:
		t2 = property.TextAlignJustifyAll
	default:
		return nil
	}
	return &t2
}

func ToPropertyField(f *property.Field, parent *property.Property, gl *property.GroupList, g *property.Group) *PropertyField {
	if f == nil {
		return nil
	}

	var links []*PropertyFieldLink
	if flinks := f.Links(); flinks != nil {
		links = make([]*PropertyFieldLink, 0, flinks.Len())
		for _, l := range flinks.Links() {
			links = append(links, ToPropertyFieldLink(l))
		}
	}

	return &PropertyField{
		ID:       propertyFieldID(parent, gl, g, f),
		ParentID: parent.ID().ID(),
		SchemaID: parent.Schema(),
		FieldID:  f.Field(),
		Value:    ToPropertyValue(f.Value()),
		Type:     ToValueType(value.Type(f.Type())),
		Links:    links,
	}
}

func ToPropertyFieldLinks(flinks *property.Links) []*PropertyFieldLink {
	if flinks == nil {
		return nil
	}
	var links []*PropertyFieldLink
	links = make([]*PropertyFieldLink, 0, flinks.Len())
	for _, l := range flinks.Links() {
		links = append(links, ToPropertyFieldLink(l))
	}
	return links
}

func FromPropertyFieldLink(datasetSchema, ds, fields []*id.ID) *property.Links {
	if len(datasetSchema) != len(fields) || (ds != nil && len(ds) != len(fields) && len(ds) > 1) {
		return nil
	}

	links := make([]*property.Link, 0, len(datasetSchema))
	for i, dss := range datasetSchema {
		f := fields[i]
		if dss == nil || f == nil {
			return nil
		}
		dsid := id.DatasetSchemaID(*dss)
		dsfid := id.DatasetSchemaFieldID(*f)
		if len(ds) == 0 || (len(ds) == 1 && i > 0) {
			links = append(links, property.NewLinkFieldOnly(dsid, dsfid))
		} else {
			d := ds[i]
			if d == nil {
				return nil
			}
			links = append(links, property.NewLink(id.DatasetID(*d), dsid, dsfid))
		}
	}

	return property.NewLinks(links)
}

func ToPropertyFieldLink(link *property.Link) *PropertyFieldLink {
	return &PropertyFieldLink{
		DatasetID:            link.Dataset().IDRef(),
		DatasetSchemaID:      link.DatasetSchema().ID(),
		DatasetSchemaFieldID: link.DatasetSchemaField().ID(),
	}
}

func ToProperty(property *property.Property) *Property {
	if property == nil {
		return nil
	}

	pitems := property.Items()
	items := make([]PropertyItem, 0, len(pitems))
	for _, i := range pitems {
		items = append(items, ToPropertyItem(i, property, nil))
	}

	return &Property{
		ID:       property.ID().ID(),
		SchemaID: property.Schema(),
		Items:    items,
	}
}

func ToPropertySchema(propertySchema *property.Schema) *PropertySchema {
	if propertySchema == nil {
		return nil
	}

	pgroups := propertySchema.Groups()
	groups := make([]*PropertySchemaGroup, 0, len(pgroups))
	for _, g := range pgroups {
		groups = append(groups, ToPropertySchemaGroup(g))
	}

	return &PropertySchema{
		ID:             propertySchema.ID(),
		Groups:         groups,
		LinkableFields: ToPropertyLinkableFields(propertySchema.ID(), propertySchema.LinkableFields()),
	}
}

func ToPropertyLinkableFields(sid id.PropertySchemaID, l property.LinkableFields) *PropertyLinkableFields {
	return &PropertyLinkableFields{
		SchemaID: sid,
		Latlng:   l.LatLng.FieldRef(),
		URL:      l.URL.FieldRef(),
	}
}

func ToPropertySchemaField(f *property.SchemaField) *PropertySchemaField {
	if f == nil {
		return nil
	}

	var choices []*PropertySchemaFieldChoice
	if c := f.Choices(); c != nil {
		choices = make([]*PropertySchemaFieldChoice, 0, len(c))
		for _, k := range c {
			choices = append(choices, &PropertySchemaFieldChoice{
				Key:                k.Key,
				Title:              k.Title.String(),
				AllTranslatedTitle: k.Title,
				Icon:               stringToRef(k.Icon),
			})
		}
	}

	return &PropertySchemaField{
		FieldID:                  f.ID(),
		Type:                     ToValueType(value.Type(f.Type())),
		Title:                    f.Title().String(),
		Description:              f.Description().String(),
		Prefix:                   stringToRef(f.Prefix()),
		Suffix:                   stringToRef(f.Suffix()),
		DefaultValue:             ToPropertyValue(f.DefaultValue()),
		UI:                       ToPropertySchemaFieldUI(f.UI()),
		Min:                      f.Min(),
		Max:                      f.Max(),
		Choices:                  choices,
		IsAvailableIf:            ToPropertyConditon(f.IsAvailableIf()),
		AllTranslatedTitle:       f.Title(),
		AllTranslatedDescription: f.Description(),
	}
}

func ToPropertySchemaFieldUI(ui *property.SchemaFieldUI) *PropertySchemaFieldUI {
	if ui == nil {
		return nil
	}
	ui2 := PropertySchemaFieldUI("")
	switch *ui {
	case property.SchemaFieldUIMultiline:
		ui2 = PropertySchemaFieldUIMultiline
	case property.SchemaFieldUISelection:
		ui2 = PropertySchemaFieldUISelection
	case property.SchemaFieldUIColor:
		ui2 = PropertySchemaFieldUIColor
	case property.SchemaFieldUIRange:
		ui2 = PropertySchemaFieldUIRange
	case property.SchemaFieldUIImage:
		ui2 = PropertySchemaFieldUIImage
	case property.SchemaFieldUIVideo:
		ui2 = PropertySchemaFieldUIVideo
	case property.SchemaFieldUIFile:
		ui2 = PropertySchemaFieldUIFile
	case property.SchemaFieldUILayer:
		ui2 = PropertySchemaFieldUILayer
	case property.SchemaFieldUICameraPose:
		ui2 = PropertySchemaFieldUICameraPose
	}
	if ui2 != PropertySchemaFieldUI("") {
		return &ui2
	}
	return nil
}

func ToMergedPropertyFromMetadata(m *property.MergedMetadata) *MergedProperty {
	if m == nil {
		return nil
	}
	return &MergedProperty{
		OriginalID:      m.Original.IDRef(),
		ParentID:        m.Parent.IDRef(),
		LinkedDatasetID: m.LinkedDataset.IDRef(),
		Groups:          nil, // resolved by graphql resolver
	}
}

func ToMergedProperty(m *property.Merged) *MergedProperty {
	if m == nil {
		return nil
	}
	groups := make([]*MergedPropertyGroup, 0, len(m.Groups))
	for _, f := range m.Groups {
		groups = append(groups, ToMergedPropertyGroup(f, m))
	}
	return &MergedProperty{
		OriginalID:      m.Original.IDRef(),
		ParentID:        m.Parent.IDRef(),
		SchemaID:        &m.Schema,
		LinkedDatasetID: m.LinkedDataset.IDRef(),
		Groups:          groups,
	}
}

func ToMergedPropertyGroup(f *property.MergedGroup, p *property.Merged) *MergedPropertyGroup {
	if f == nil {
		return nil
	}
	fields := make([]*MergedPropertyField, 0, len(f.Fields))
	for _, f2 := range f.Fields {
		fields = append(fields, ToMergedPropertyField(f2, p.Schema))
	}
	groups := make([]*MergedPropertyGroup, 0, len(f.Groups))
	for _, f2 := range f.Groups {
		groups = append(groups, ToMergedPropertyGroup(f2, p))
	}
	return &MergedPropertyGroup{
		OriginalPropertyID: p.Original.IDRef(),
		ParentPropertyID:   p.Parent.IDRef(),
		OriginalID:         f.Original.IDRef(),
		SchemaGroupID:      f.SchemaGroup,
		ParentID:           f.Parent.IDRef(),
		SchemaID:           p.Schema.Ref(),
		LinkedDatasetID:    f.LinkedDataset.IDRef(),
		Fields:             fields,
		Groups:             groups,
	}
}

func ToMergedPropertyField(f *property.MergedField, s id.PropertySchemaID) *MergedPropertyField {
	if f == nil {
		return nil
	}
	return &MergedPropertyField{
		FieldID:    f.ID,
		SchemaID:   s,
		Links:      ToPropertyFieldLinks(f.Links),
		Value:      ToPropertyValue(f.Value),
		Type:       ToValueType(value.Type(f.Type)),
		Overridden: f.Overridden,
	}
}

func ToPropertySchemaGroup(g *property.SchemaGroup) *PropertySchemaGroup {
	if g == nil {
		return nil
	}
	gfields := g.Fields()
	fields := make([]*PropertySchemaField, 0, len(gfields))
	var representativeField *PropertySchemaField
	representativeFieldID := g.RepresentativeFieldID()
	for _, f := range gfields {
		f2 := ToPropertySchemaField(f)
		fields = append(fields, f2)
		if representativeFieldID != nil && f.ID() == *representativeFieldID {
			representativeField = f2
		}
	}
	return &PropertySchemaGroup{
		SchemaGroupID:         g.ID(),
		SchemaID:              g.Schema(),
		IsList:                g.IsList(),
		Title:                 g.Title().StringRef(),
		Fields:                fields,
		RepresentativeFieldID: representativeFieldID,
		RepresentativeField:   representativeField,
		AllTranslatedTitle:    g.Title(),
		IsAvailableIf:         ToPropertyConditon(g.IsAvailableIf()),
	}
}

func ToPropertyGroup(g *property.Group, p *property.Property, gl *property.GroupList) *PropertyGroup {
	if g == nil {
		return nil
	}

	gfields := g.Fields()
	fields := make([]*PropertyField, 0, len(gfields))
	for _, f := range gfields {
		fields = append(fields, ToPropertyField(f, p, gl, g))
	}

	return &PropertyGroup{
		ID:            g.ID().ID(),
		SchemaID:      g.Schema(),
		SchemaGroupID: g.SchemaGroup(),
		Fields:        fields,
	}
}

func ToPropertyGroupList(g *property.GroupList, p *property.Property) *PropertyGroupList {
	if g == nil {
		return nil
	}

	ggroups := g.Groups()
	groups := make([]*PropertyGroup, 0, len(ggroups))
	for _, f := range ggroups {
		groups = append(groups, ToPropertyGroup(f, p, g))
	}

	return &PropertyGroupList{
		ID:            g.ID().ID(),
		SchemaID:      g.Schema(),
		SchemaGroupID: g.SchemaGroup(),
		Groups:        groups,
	}
}

func ToPropertyItem(i property.Item, p *property.Property, pgl *property.GroupList) PropertyItem {
	if i == nil {
		return nil
	}

	if g := property.ToGroup(i); g != nil {
		return ToPropertyGroup(g, p, pgl)
	} else if gl := property.ToGroupList(i); gl != nil {
		return ToPropertyGroupList(gl, p)
	}
	return nil
}

func ToPropertyConditon(c *property.Condition) *PropertyCondition {
	if c == nil {
		return nil
	}

	return &PropertyCondition{
		FieldID: c.Field,
		Value:   ToPropertyValue(c.Value),
		Type:    ToValueType(value.Type(c.Value.Type())),
	}
}

func FromPointer(schemaItem *id.PropertySchemaGroupID, item *id.ID, field *id.PropertySchemaFieldID) *property.Pointer {
	i := id.PropertyItemIDFromRefID(item)
	return property.NewPointer(schemaItem, i, field)
}

func ToPropertyLatLng(lat, lng *float64) *property.LatLng {
	var latlng *property.LatLng
	if lat != nil && lng != nil {
		latlng2 := property.LatLng{Lat: *lat, Lng: *lng}
		latlng = &latlng2
	}
	return latlng
}

func propertyFieldID(property *property.Property, groupList *property.GroupList, group *property.Group, field *property.Field) string {
	if property == nil || group == nil || field == nil {
		return ""
	}

	const sep = "_"
	var sb strings.Builder
	sb.WriteString(property.ID().String())
	sb.WriteString(sep)
	if groupList != nil {
		sb.WriteString(groupList.ID().String())
		sb.WriteString(sep)
	}
	sb.WriteString(group.ID().String())
	sb.WriteString(sep)
	sb.WriteString(field.Field().String())

	return sb.String()
}

func getPropertySchemaFieldIDFromGQLPropertyFieldID(i string) string {
	const sep = "_"
	s := strings.Split(i, sep)
	if len(s) > 0 {
		return s[len(s)-1]
	}
	return ""
}
