package manifest

import (
	"errors"
	"fmt"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/visualizer"
)

var errInvalidManifestWith = rerror.With(ErrInvalidManifest)

func (i *Root) manifest(sid *id.SceneID) (*Manifest, error) {
	var pid id.PluginID
	var err error
	if i.System && string(i.ID) == id.OfficialPluginID.Name() {
		pid = id.OfficialPluginID
	} else {
		pid, err = id.NewPluginID(string(i.ID), i.Version, sid)
		if err != nil {
			return nil, errInvalidManifestWith(fmt.Errorf("invalid plugin id: %s %s %s", i.ID, i.Version, sid))
		}
	}

	var pluginSchema *property.Schema
	if i.Schema != nil {
		schema, err := i.Schema.schema(pid, "@")
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
		extension, extensionSchema, err2 := e.extension(pid, i.System)
		if err2 != nil {
			return nil, errInvalidManifestWith(rerror.From(fmt.Sprintf("ext (%s)", e.ID), err2))
		}
		extensions = append(extensions, extension)
		extensionSchemas = append(extensionSchemas, extensionSchema)
	}

	var author, desc, repository string
	if i.Author != nil {
		author = *i.Author
	}
	if i.Description != nil {
		desc = *i.Description
	}
	if i.Repository != nil {
		repository = *i.Repository
	}

	p, err := plugin.New().
		ID(pid).
		Name(i18n.StringFrom(i.Name)).
		Author(author).
		Description(i18n.StringFrom(desc)).
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

func (i Extension) extension(pluginID id.PluginID, sys bool) (*plugin.Extension, *property.Schema, error) {
	eid := string(i.ID)
	schema, err := i.Schema.schema(pluginID, eid)
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
	case "cluster":
		typ = plugin.ExtensionTypeCluster
	case "":
		return nil, nil, errors.New("type missing")
	default:
		return nil, nil, fmt.Errorf("invalid type: %s", i.Type)
	}

	var desc, icon string
	var singleOnly bool
	if i.Description != nil {
		desc = *i.Description
	}
	if i.Icon != nil {
		icon = *i.Icon
	}
	if i.SingleOnly != nil {
		singleOnly = *i.SingleOnly
	}

	ext, err := plugin.NewExtension().
		ID(id.PluginExtensionID(eid)).
		Name(i18n.StringFrom(i.Name)).
		Description(i18n.StringFrom(desc)).
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

func (i *PropertySchema) schema(pluginID id.PluginID, idstr string) (*property.Schema, error) {
	psid, err := id.PropertySchemaIDFrom(pluginID.String() + "/" + idstr)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %s", pluginID.String()+"/"+idstr)
	}

	if i == nil {
		return property.NewSchema().
			ID(psid).
			Build()
	}

	// items
	items := make([]*property.SchemaGroup, 0, len(i.Groups))
	for _, d := range i.Groups {
		item, err := d.schemaGroup(psid)
		if err != nil {
			return nil, rerror.From(fmt.Sprintf("item (%s)", d.ID), err)
		}
		items = append(items, item)
	}

	// schema
	schema, err := property.NewSchema().
		ID(psid).
		Version(int(i.Version)).
		Groups(items).
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

func (p *PropertyPointer) pointer() *property.Pointer {
	if p == nil || p.FieldID == "" && p.SchemaGroupID == "" {
		return nil
	}
	return property.NewPointer(
		id.PropertySchemaGroupIDFrom(&p.SchemaGroupID),
		nil,
		id.PropertySchemaFieldIDFrom(&p.FieldID),
	)
}

func (i PropertySchemaGroup) schemaGroup(sid id.PropertySchemaID) (*property.SchemaGroup, error) {
	title := i.Title
	var representativeField *id.PropertySchemaFieldID
	if i.RepresentativeField != nil {
		representativeField = id.PropertySchemaFieldID(*i.RepresentativeField).Ref()
	}

	// fields
	fields := make([]*property.SchemaField, 0, len(i.Fields))
	for _, d := range i.Fields {
		field, err := d.schemaField()
		if err != nil {
			return nil, rerror.From(fmt.Sprintf("field (%s)", d.ID), err)
		}
		fields = append(fields, field)
	}

	return property.NewSchemaGroup().
		ID(id.PropertySchemaGroupID(i.ID)).
		Schema(sid).
		IsList(i.List).
		Fields(fields).
		Title(i18n.StringFrom(title)).
		RepresentativeField(representativeField).
		IsAvailableIf(i.AvailableIf.condition()).
		Build()
}

func (o *PropertyCondition) condition() *property.Condition {
	if o == nil {
		return nil
	}
	return &property.Condition{
		Field: id.PropertySchemaFieldID(o.Field),
		Value: toValue(o.Value, o.Type),
	}
}

func (i PropertySchemaField) schemaField() (*property.SchemaField, error) {
	t := property.ValueType(i.Type)
	if !t.Valid() {
		return nil, fmt.Errorf("invalid value type: %s", i.Type)
	}

	var title, desc, prefix, suffix string
	if i.Title != nil {
		title = *i.Title
	}
	if i.Description != nil {
		desc = *i.Description
	}
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
			choices = append(choices, *c.choice())
		}
	}

	f, err := property.NewSchemaField().
		ID(id.PropertySchemaFieldID(i.ID)).
		Name(i18n.StringFrom(title)).
		Description(i18n.StringFrom(desc)).
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

func (c *Choice) choice() *property.SchemaFieldChoice {
	if c == nil {
		return nil
	}
	return &property.SchemaFieldChoice{
		Key:   c.Key,
		Title: i18n.StringFrom(c.Label),
		Icon:  c.Icon,
	}
}

func toValue(v interface{}, t Valuetype) *property.Value {
	return property.ValueType(t).ValueFrom(v)
}
