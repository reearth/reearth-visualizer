package gqlmodel

import (
	"strings"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/value"
	"github.com/reearth/reearthx/util"
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
	case property.Spacing:
		res = Spacing{
			Top:    v2.Top,
			Bottom: v2.Bottom,
			Left:   v2.Left,
			Right:  v2.Right,
		}
	case property.Timeline:
		res = Timeline{
			CurrentTime: v2.CurrentTime,
			StartTime:   v2.StartTime,
			EndTime:     v2.EndTime,
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
	case *Spacing:
		v = property.Spacing{
			Top:    v2.Top,
			Bottom: v2.Bottom,
			Left:   v2.Left,
			Right:  v2.Right,
		}
	case *Timeline:
		v = property.Timeline{
			CurrentTime: v2.CurrentTime,
			StartTime:   v2.StartTime,
			EndTime:     v2.EndTime,
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

	return &PropertyField{
		ID:       propertyFieldID(parent, gl, g, f),
		ParentID: IDFrom(parent.ID()),
		SchemaID: IDFromPropertySchemaID(parent.Schema()),
		FieldID:  ID(f.Field()),
		Value:    ToPropertyValue(f.Value()),
		Type:     ToValueType(value.Type(f.Type())),
		Links:    util.Map(f.Links().Links(), ToPropertyFieldLink),
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

func FromPropertyFieldLink(datasetSchema, ds, fields []ID) (*property.Links, error) {
	if len(datasetSchema) != len(fields) || (ds != nil && len(ds) != len(fields) && len(ds) > 1) {
		return nil, nil
	}

	links := make([]*property.Link, 0, len(datasetSchema))
	for i, dss := range datasetSchema {
		f := fields[i]
		dsid, dsfid, err := ToID2[id.DatasetSchema, id.DatasetField](dss, f)
		if err != nil {
			return nil, err
		}
		if len(ds) == 0 || (len(ds) == 1 && i > 0) {
			links = append(links, property.NewLinkFieldOnly(dsid, dsfid))
		} else {
			did, err := ToID[id.Dataset](ds[i])
			if err != nil {
				return nil, err
			}
			links = append(links, property.NewLink(did, dsid, dsfid))
		}
	}

	return property.NewLinks(links), nil
}

func ToPropertyFieldLink(link *property.Link) *PropertyFieldLink {
	ds := link.DatasetSchema()
	df := link.DatasetSchemaField()
	if ds == nil || df == nil {
		return nil
	}

	return &PropertyFieldLink{
		DatasetID:            IDFromRef(link.Dataset()),
		DatasetSchemaID:      IDFrom(*ds),
		DatasetSchemaFieldID: IDFrom(*df),
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
		ID:       IDFrom(property.ID()),
		SchemaID: IDFromPropertySchemaID(property.Schema()),
		Items:    items,
	}
}

func ToPropertySchema(propertySchema *property.Schema) *PropertySchema {
	if propertySchema == nil {
		return nil
	}

	psid := propertySchema.ID()
	return &PropertySchema{
		ID: IDFromPropertySchemaID(psid),
		Groups: util.Map(propertySchema.Groups().Groups(), func(g *property.SchemaGroup) *PropertySchemaGroup {
			return ToPropertySchemaGroup(g, psid)
		}),
		LinkableFields: ToPropertyLinkableFields(propertySchema.ID(), propertySchema.LinkableFields()),
	}
}

func ToPropertyLinkableFields(sid id.PropertySchemaID, l property.LinkableFields) *PropertyLinkableFields {
	var latlng, url *id.PropertyFieldID
	if l.LatLng != nil {
		latlng = &l.LatLng.Field
	}
	if l.URL != nil {
		url = &l.URL.Field
	}
	return &PropertyLinkableFields{
		SchemaID: IDFromPropertySchemaID(sid),
		Latlng:   IDFromStringRef(latlng),
		URL:      IDFromStringRef(url),
	}
}

func ToPropertySchemaField(f *property.SchemaField) *PropertySchemaField {
	if f == nil {
		return nil
	}

	return &PropertySchemaField{
		FieldID:      ID(f.ID()),
		Type:         ToValueType(value.Type(f.Type())),
		Title:        f.Title().String(),
		Description:  f.Description().String(),
		Prefix:       stringToRef(f.Prefix()),
		Suffix:       stringToRef(f.Suffix()),
		DefaultValue: ToPropertyValue(f.DefaultValue()),
		UI:           ToPropertySchemaFieldUI(f.UI()),
		Min:          f.Min(),
		Max:          f.Max(),
		Choices: util.Map(f.Choices(), func(c property.SchemaFieldChoice) *PropertySchemaFieldChoice {
			return &PropertySchemaFieldChoice{
				Key:                c.Key,
				Title:              c.Title.String(),
				AllTranslatedTitle: c.Title,
				Icon:               stringToRef(c.Icon),
			}
		}),
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
	case property.SchemaFieldUISlider:
		ui2 = PropertySchemaFieldUISlider
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
	case property.SchemaFieldUIPadding:
		ui2 = PropertySchemaFieldUIPadding
	case property.SchemaFieldUIMargin:
		ui2 = PropertySchemaFieldUIMargin
	case property.SchemaFieldUIDateTime:
		ui2 = PropertySchemaFieldUIDatetime
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
		OriginalID:      IDFromRef(m.Original),
		ParentID:        IDFromRef(m.Parent),
		LinkedDatasetID: IDFromRef(m.LinkedDataset),
		Groups:          nil, // resolved by graphql resolver
	}
}

func ToMergedProperty(m *property.Merged) *MergedProperty {
	if m == nil {
		return nil
	}

	return &MergedProperty{
		OriginalID:      IDFromRef(m.Original),
		ParentID:        IDFromRef(m.Parent),
		SchemaID:        IDFromPropertySchemaIDRef(m.Schema.Ref()),
		LinkedDatasetID: IDFromRef(m.LinkedDataset),
		Groups: util.Map(m.Groups, func(g *property.MergedGroup) *MergedPropertyGroup {
			return ToMergedPropertyGroup(g, m)
		}),
	}
}

func ToMergedPropertyGroup(f *property.MergedGroup, p *property.Merged) *MergedPropertyGroup {
	if f == nil {
		return nil
	}

	return &MergedPropertyGroup{
		OriginalPropertyID: IDFromRef(p.Original),
		ParentPropertyID:   IDFromRef(p.Parent),
		OriginalID:         IDFromRef(f.Original),
		SchemaGroupID:      ID(f.SchemaGroup),
		ParentID:           IDFromRef(f.Parent),
		SchemaID:           IDFromPropertySchemaIDRef(p.Schema.Ref()),
		LinkedDatasetID:    IDFromRef(f.LinkedDataset),
		Fields: util.Map(f.Fields, func(f *property.MergedField) *MergedPropertyField {
			return ToMergedPropertyField(f, p.Schema)
		}),
		Groups: util.Map(f.Groups, func(g *property.MergedGroup) *MergedPropertyGroup {
			return ToMergedPropertyGroup(g, p)
		}),
	}
}

func ToMergedPropertyField(f *property.MergedField, s id.PropertySchemaID) *MergedPropertyField {
	if f == nil {
		return nil
	}

	return &MergedPropertyField{
		FieldID:    ID(f.ID),
		SchemaID:   IDFromPropertySchemaID(s),
		Links:      ToPropertyFieldLinks(f.Links),
		Value:      ToPropertyValue(f.Value),
		Type:       ToValueType(value.Type(f.Type)),
		Overridden: f.Overridden,
	}
}

func ToPropertySchemaGroup(g *property.SchemaGroup, s property.SchemaID) *PropertySchemaGroup {
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
		SchemaGroupID:         ID(g.ID()),
		SchemaID:              IDFromPropertySchemaID(s),
		IsList:                g.IsList(),
		Title:                 g.Title().StringRef(),
		Fields:                fields,
		Collection:            g.Collection().StringRef(),
		RepresentativeFieldID: IDFromStringRef(representativeFieldID),
		RepresentativeField:   representativeField,
		AllTranslatedTitle:    g.Title(),
		IsAvailableIf:         ToPropertyConditon(g.IsAvailableIf()),
	}
}

func ToPropertyGroup(g *property.Group, p *property.Property, gl *property.GroupList) *PropertyGroup {
	if g == nil {
		return nil
	}

	return &PropertyGroup{
		ID:            IDFrom(g.ID()),
		SchemaID:      IDFromPropertySchemaID(p.Schema()),
		SchemaGroupID: ID(g.SchemaGroup()),
		Fields: util.Map(g.Fields(nil), func(f *property.Field) *PropertyField {
			return ToPropertyField(f, p, gl, g)
		}),
	}
}

func ToPropertyGroupList(gl *property.GroupList, p *property.Property) *PropertyGroupList {
	if gl == nil {
		return nil
	}

	return &PropertyGroupList{
		ID:            IDFrom(gl.ID()),
		SchemaID:      IDFromPropertySchemaID(p.Schema()),
		SchemaGroupID: ID(gl.SchemaGroup()),
		Groups: util.Map(gl.Groups(), func(g *property.Group) *PropertyGroup {
			return ToPropertyGroup(g, p, gl)
		}),
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
		FieldID: ID(c.Field),
		Value:   ToPropertyValue(c.Value),
		Type:    ToValueType(value.Type(c.Value.Type())),
	}
}

func FromPointer(schemaItem *id.PropertySchemaGroupID, item *ID, field *id.PropertyFieldID) *property.Pointer {
	return property.NewPointer(schemaItem, ToIDRef[id.PropertyItem](item), field)
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
