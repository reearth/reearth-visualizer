package manifest

import (
	"fmt"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/visualizer"
)

func (i *Root) manifest() (*Manifest, error) {
	var pid id.PluginID
	var err error
	if i.System && string(i.ID) == id.OfficialPluginID.Name() {
		pid = id.OfficialPluginID
	} else {
		pid, err = id.PluginIDFrom(string(i.ID) + "#" + i.Version)
		if err != nil {
			return nil, ErrInvalidManifest
		}
	}

	if i.Title == "" {
		i.Title = string(i.ID)
	}

	var pluginSchema *property.Schema
	if i.Schema != nil {
		schema, err := i.Schema.schema(pid, "@")
		if err != nil {
			return nil, err
		}
		pluginSchema = schema
	}

	extensions := make([]*plugin.Extension, 0, len(i.Extensions))
	extensionSchemas := make([]*property.Schema, 0, len(i.Extensions))
	for _, e := range i.Extensions {
		extension, extensionSchema, err2 := e.extension(pid, i.System)
		if err2 != nil {
			return nil, err2
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
		Name(i18n.StringFrom(i.Title)).
		Author(author).
		Description(i18n.StringFrom(desc)).
		RepositoryURL(repository).
		Schema(pluginSchema.IDRef()).
		Extensions(extensions).
		Build()
	if err != nil {
		return nil, err
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
		return nil, nil, err
	}

	var viz visualizer.Visualizer
	switch i.Visualizer {
	case "cesium":
		viz = visualizer.VisualizerCesium
	default:
		return nil, nil, ErrInvalidManifest
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
	default:
		return nil, nil, ErrInvalidManifest
	}

	var desc, icon string
	if i.Description != nil {
		desc = *i.Description
	}
	if i.Icon != nil {
		icon = *i.Icon
	}

	ext, err := plugin.NewExtension().
		ID(id.PluginExtensionID(eid)).
		Name(i18n.StringFrom(i.Title)).
		Description(i18n.StringFrom(desc)).
		Visualizer(viz).
		Type(typ).
		Icon(icon).
		Schema(schema.ID()).
		System(sys).
		Build()

	if err != nil {
		return nil, nil, err
	}
	return ext, schema, nil
}

func (i *PropertySchema) schema(pluginID id.PluginID, idstr string) (*property.Schema, error) {
	psid, err := id.PropertySchemaIDFrom(pluginID.String() + "/" + idstr)
	if err != nil {
		return nil, err
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
			return nil, err
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
		return nil, err
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
		id.PropertySchemaFieldIDFrom(&p.SchemaGroupID),
		nil,
		id.PropertySchemaFieldIDFrom(&p.FieldID),
	)
}

func (i PropertySchemaGroup) schemaGroup(sid id.PropertySchemaID) (*property.SchemaGroup, error) {
	title := i.Title
	var representativeField *id.PropertySchemaFieldID
	if i.RepresentativeField != nil {
		representativeField2 := id.PropertySchemaFieldID(*i.RepresentativeField)
		representativeField = &representativeField2
	}

	// fields
	fields := make([]*property.SchemaField, 0, len(i.Fields))
	for _, d := range i.Fields {
		field, err := d.schemaField()
		if err != nil {
			return nil, err
		}
		fields = append(fields, field)
	}

	return property.NewSchemaGroup().
		ID(id.PropertySchemaFieldID(i.ID)).
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
	t, ok := property.ValueTypeFrom(string(i.Type))
	if !ok {
		return nil, fmt.Errorf("schema field: invalid value type")
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
	vt, ok := property.ValueTypeFrom(string(t))
	if !ok {
		return nil
	}
	return vt.ValueFromUnsafe(v)
}
