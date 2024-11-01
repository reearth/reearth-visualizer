package manifest

import (
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/rerror"
)

var errInvalidManifestWith = rerror.With(ErrInvalidManifest)

func (i *Root) manifest(sid *plugin.SceneID, tl *TranslatedRoot) (*Manifest, error) {
	var pid plugin.ID
	var err error
	if i.System && string(i.ID) == plugin.OfficialPluginID.Name() {
		pid = plugin.OfficialPluginID
	} else {
		pid, err = plugin.NewID(string(i.ID), i.Version, sid)
		if err != nil {
			return nil, errInvalidManifestWith(fmt.Errorf("invalid plugin id: %s %s %s", i.ID, i.Version, sid))
		}
	}

	var pluginSchema *property.Schema
	if i.Schema != nil {
		var ts *TranslatedPropertySchema
		if tl != nil {
			ts = &tl.Schema
		}
		schema, err := i.Schema.schema(pid, "@", ts)
		if err != nil {
			return nil, errInvalidManifestWith(rerror.From("plugin property schema", err))
		}
		pluginSchema = schema
	}

	var extensions []*plugin.Extension
	var extensionSchemas []*property.Schema
	if l := len(i.Extensions); l > 0 {
		extensions = make([]*plugin.Extension, 0, l)
		extensionSchemas = make([]*property.Schema, 0, l)
	}

	for _, e := range i.Extensions {
		var te *TranslatedExtension
		if tl != nil {
			te = tl.Extensions[string(e.ID)]
		}

		extension, extensionSchema, err2 := e.extension(pid, i.System, te)
		if err2 != nil {
			return nil, errInvalidManifestWith(rerror.From(fmt.Sprintf("ext (%s)", e.ID), err2))
		}
		extensions = append(extensions, extension)
		extensionSchemas = append(extensionSchemas, extensionSchema)
	}

	var author, repository string
	if i.Author != nil {
		author = *i.Author
	}
	if i.Repository != nil {
		repository = *i.Repository
	}

	var name, desc i18n.String
	if tl != nil {
		name = tl.Name
		desc = tl.Description
	}
	name = name.WithDefault(i.Name)
	desc = desc.WithDefaultRef(i.Description)

	p, err := plugin.New().
		ID(pid).
		Name(name).
		Author(author).
		Description(desc).
		RepositoryURL(repository).
		Schema(pluginSchema.IDRef()).
		Extensions(extensions).
		Build()
	if err != nil {
		return nil, errInvalidManifestWith(rerror.From("build", err))
	}

	return &Manifest{
		Plugin:          p,
		Schema:          pluginSchema,
		ExtensionSchema: extensionSchemas,
	}, nil
}

func (i Extension) extension(pluginID plugin.ID, sys bool, te *TranslatedExtension) (*plugin.Extension, *property.Schema, error) {
	eid := string(i.ID)
	var ts *TranslatedPropertySchema
	if te != nil {
		ts = &te.PropertySchema
	}
	schema, err := i.Schema.schema(pluginID, eid, ts)
	if err != nil {
		return nil, nil, rerror.From("property schema", err)
	}

	var viz visualizer.Visualizer
	if i.Visualizer != nil {
		switch *i.Visualizer {
		case "cesium":
			viz = visualizer.VisualizerCesium
		case "":
			return nil, nil, errors.New("visualizer missing")
		default:
			return nil, nil, fmt.Errorf("invalid visualizer: %s", *i.Visualizer)
		}
	} else if i.Type == "visualizer" {
		return nil, nil, errors.New("visualizer missing")
	}

	var typ plugin.ExtensionType
	switch i.Type {
	case "primitive":
		typ = plugin.ExtensionTypePrimitive
	case "widget":
		typ = plugin.ExtensionTypeWidget
	case "block":
		typ = plugin.ExtensionTypeBlock
	case "visualizer":
		typ = plugin.ExtensionTypeVisualizer
	case "infobox":
		typ = plugin.ExtensionTypeInfobox
	case "infoboxBlock":
		typ = plugin.ExtensionTypeInfoboxBlock
	case "cluster":
		typ = plugin.ExtensionTypeCluster
	case "story":
		typ = plugin.ExtensionTypeStory
	case "storyPage":
		typ = plugin.ExtensionTypeStoryPage
	case "storyBlock":
		typ = plugin.ExtensionTypeStoryBlock
	case "":
		return nil, nil, errors.New("type missing")
	default:
		return nil, nil, fmt.Errorf("invalid type: %s", i.Type)
	}

	var icon string
	var singleOnly bool
	if i.Icon != nil {
		icon = *i.Icon
	}
	if i.SingleOnly != nil {
		singleOnly = *i.SingleOnly
	}

	var name, desc i18n.String
	if te != nil {
		name = te.Name
		desc = te.Description
	}
	name = name.WithDefault(i.Name)
	desc = desc.WithDefaultRef(i.Description)

	ext, err := plugin.NewExtension().
		ID(plugin.ExtensionID(eid)).
		Name(name).
		Description(desc).
		Visualizer(viz).
		Type(typ).
		SingleOnly(singleOnly).
		WidgetLayout(i.WidgetLayout.layout()).
		Icon(icon).
		Schema(schema.ID()).
		System(sys).
		Build()

	if err != nil {
		return nil, nil, rerror.From("build", err)
	}
	return ext, schema, nil
}

func (l *WidgetLayout) layout() *plugin.WidgetLayout {
	if l == nil {
		return nil
	}

	horizontallyExtendable := false
	verticallyExtendable := false
	extended := false

	if l.Extendable != nil && l.Extendable.Horizontally != nil && *l.Extendable.Horizontally {
		horizontallyExtendable = true
	}
	if l.Extendable != nil && l.Extendable.Vertically != nil && *l.Extendable.Vertically {
		verticallyExtendable = true
	}
	if l.Extended != nil && *l.Extended {
		extended = false
	}

	var dl *plugin.WidgetLocation
	if l.DefaultLocation != nil {
		dl = &plugin.WidgetLocation{
			Zone:    plugin.WidgetZoneType(l.DefaultLocation.Zone),
			Section: plugin.WidgetSectionType(l.DefaultLocation.Section),
			Area:    plugin.WidgetAreaType(l.DefaultLocation.Area),
		}
	}

	return plugin.NewWidgetLayout(horizontallyExtendable, verticallyExtendable, extended, l.Floating, dl).Ref()
}

func (i *PropertySchema) schema(pluginID plugin.ID, idstr string, ts *TranslatedPropertySchema) (*property.Schema, error) {
	psid, err := property.SchemaIDFrom(pluginID.String() + "/" + idstr)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %s", pluginID.String()+"/"+idstr)
	}

	if i == nil {
		return property.NewSchema().
			ID(psid).
			Build()
	}

	// groups
	groups := make([]*property.SchemaGroup, 0, len(i.Groups))
	for _, d := range i.Groups {
		var tg *TranslatedPropertySchemaGroup
		if ts != nil {
			tg = (*ts)[string(d.ID)]
		}

		item, err := d.schemaGroup(tg)
		if err != nil {
			return nil, rerror.From(fmt.Sprintf("item (%s)", d.ID), err)
		}
		groups = append(groups, item)
	}
	sgroups := property.NewSchemaGroupList(groups)
	if sgroups == nil {
		return nil, fmt.Errorf("invalid group; it is empty or it may contain some duplicated groups or fields")
	}

	// schema
	schema, err := property.NewSchema().
		ID(psid).
		Version(int(i.Version)).
		Groups(sgroups).
		LinkableFields(i.Linkable.linkable()).
		Build()
	if err != nil {
		return nil, rerror.From("build", err)
	}
	return schema, nil
}

func (p *PropertyLinkableFields) linkable() property.LinkableFields {
	if p == nil {
		return property.LinkableFields{}
	}
	return property.LinkableFields{
		LatLng: p.Latlng.pointer(),
		URL:    p.URL.pointer(),
	}
}

func (p *PropertyPointer) pointer() *property.SchemaFieldPointer {
	if p == nil || p.FieldID == "" && p.SchemaGroupID == "" {
		return nil
	}
	return &property.SchemaFieldPointer{
		SchemaGroup: property.SchemaGroupID(p.SchemaGroupID),
		Field:       property.FieldID(p.FieldID),
	}
}

func (i PropertySchemaGroup) schemaGroup(tg *TranslatedPropertySchemaGroup) (*property.SchemaGroup, error) {
	var title i18n.String
	if tg != nil {
		title = tg.Title.Clone()
	}
	title = title.WithDefault(i.Title)

	var collection i18n.String
	if tg != nil && tg.Collection != nil {
		collection = tg.Collection.Clone()
	}
	if i.Collection != nil {
		collection = collection.WithDefault(*i.Collection)
	}

	var representativeField *property.FieldID
	if i.RepresentativeField != nil {
		representativeField = property.FieldID(*i.RepresentativeField).Ref()
	}

	// fields
	var fields []*property.SchemaField
	if len(i.Fields) > 0 {
		fields = make([]*property.SchemaField, 0, len(i.Fields))
		for _, d := range i.Fields {
			var tf *TranslatedPropertySchemaField
			if tg != nil {
				tf = tg.Fields[string(d.ID)]
			}

			field, err := d.schemaField(tf)
			if err != nil {
				return nil, rerror.From(fmt.Sprintf("field (%s)", d.ID), err)
			}
			fields = append(fields, field)
		}
	}

	return property.NewSchemaGroup().
		ID(property.SchemaGroupID(i.ID)).
		IsList(i.List).
		Fields(fields).
		Title(title).
		Collection(collection).
		RepresentativeField(representativeField).
		IsAvailableIf(i.AvailableIf.condition()).
		Build()
}

func (o *PropertyCondition) condition() *property.Condition {
	if o == nil {
		return nil
	}
	return &property.Condition{
		Field: property.FieldID(o.Field),
		Value: toValue(o.Value, o.Type),
	}
}

func (i PropertySchemaField) schemaField(tf *TranslatedPropertySchemaField) (*property.SchemaField, error) {
	t := property.ValueType(i.Type)
	if !t.Valid() {
		return nil, fmt.Errorf("invalid value type: %s", i.Type)
	}

	var title, desc i18n.String
	if tf != nil {
		title = tf.Title.Clone()
		desc = tf.Description.Clone()
	}
	title = title.WithDefaultRef(i.Title)
	desc = desc.WithDefaultRef(i.Description)

	var prefix, suffix string
	if i.Prefix != nil {
		prefix = *i.Prefix
	}
	if i.Suffix != nil {
		suffix = *i.Suffix
	}

	var choices []property.SchemaFieldChoice
	if len(i.Choices) > 0 {
		choices = make([]property.SchemaFieldChoice, 0, len(i.Choices))
		for _, c := range i.Choices {
			if c.Key == "" {
				continue
			}

			var t i18n.String
			if tf != nil {
				t = tf.Choices[c.Key]
			}
			choices = append(choices, c.choice(t))
		}
	}

	f, err := property.NewSchemaField().
		ID(property.FieldID(i.ID)).
		Name(title).
		Description(desc).
		Type(t).
		Prefix(prefix).
		Suffix(suffix).
		DefaultValue(toValue(i.DefaultValue, i.Type)).
		MinRef(i.Min).
		MaxRef(i.Max).
		Choices(choices).
		UIRef(property.SchemaFieldUIFromRef(i.UI)).
		IsAvailableIf(i.AvailableIf.condition()).
		Build()
	if err != nil {
		return nil, rerror.From("build", err)
	}
	return f, err
}

func (c Choice) choice(t i18n.String) property.SchemaFieldChoice {
	return property.SchemaFieldChoice{
		Key:   c.Key,
		Title: t.WithDefault(c.Label),
		Icon:  c.Icon,
	}
}

func toValue(v interface{}, t Valuetype) *property.Value {
	return property.ValueType(t).ValueFrom(v)
}
