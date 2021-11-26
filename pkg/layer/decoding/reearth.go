package decoding

import (
	"encoding/json"
	"errors"

	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/property"
)

type ReearthDecoder struct {
	d     *json.Decoder
	scene id.SceneID
}

func NewReearthDecoder(d *json.Decoder, scene id.SceneID) *ReearthDecoder {
	return &ReearthDecoder{d: d, scene: scene}
}

func (d *ReearthDecoder) Decode() (r Result, err error) {
	if d == nil || d.d == nil {
		return
	}

	var root ReearthRoot
	if err = d.d.Decode(&root); err != nil {
		return
	}

	r, err = root.Result(d.scene)
	if err != nil {
		return
	}

	err = r.Validate()
	return
}

type ReearthRoot struct {
	Reearth int             `json:"reearth"`
	Layers  []*ReearthLayer `json:"layers"`
}

func (r *ReearthRoot) Result(scene id.SceneID) (result Result, err error) {
	if r == nil {
		return
	}

	if r.Reearth != 1 {
		err = errors.New("not supported version")
		return
	}

	for _, l := range r.Layers {
		var result2 layer.InitializerResult
		i := l.layer()
		if result2, err = i.Layer(scene); err != nil {
			return
		}
		result = result.MergeInitializerResult(result2)
	}

	return
}

type ReearthLayer struct {
	Plugin              *id.PluginID          `json:"plugin"`
	Extension           *id.PluginExtensionID `json:"extension"`
	Name                string                `json:"name"`
	Infobox             *ReearthInfobox       `json:"infobox"`
	Property            *ReearthProperty      `json:"property"`
	Layers              []ReearthLayer        `json:"layers"`
	IsVisible           *bool                 `json:"isVisible"`
	LinkedDatasetSchema *id.DatasetSchemaID   `json:"linkedDatasetSchema"`
	LinkedDataset       *id.DatasetID         `json:"linkedDataset"`
}

func (l *ReearthLayer) layer() *layer.Initializer {
	if l == nil {
		return nil
	}

	var layers []*layer.Initializer
	if l.Layers != nil {
		layers = make([]*layer.Initializer, 0, len(l.Layers))
		for _, l2 := range l.Layers {
			if l3 := l2.layer(); l3 != nil {
				layers = append(layers, l3)
			}
		}
	}

	var psid *id.PropertySchemaID
	if l.Plugin != nil || l.Extension != nil {
		psid2, err := id.PropertySchemaIDFromExtension(*l.Plugin, *l.Extension)
		if err == nil {
			// if there is an error, property schema id will be nil.
			psid = psid2.Ref()
		}
	}

	var pr *property.Initializer
	if l.Property != nil {
		pr = l.Property.property(psid)
	}

	return &layer.Initializer{
		Plugin:              l.Plugin,
		Extension:           l.Extension,
		Name:                l.Name,
		Infobox:             l.Infobox.infobox(),
		IsVisible:           l.IsVisible,
		Property:            pr,
		LinkedDatasetSchema: l.LinkedDatasetSchema,
		LinkedDataset:       l.LinkedDataset,
		Layers:              layers,
	}
}

type ReearthInfobox struct {
	Property *ReearthProperty       `json:"property"`
	Blocks   []*ReearthInfoboxField `json:"blocks"`
}

func (i *ReearthInfobox) infobox() *layer.InitializerInfobox {
	if i == nil {
		return nil
	}

	var blocks []*layer.InitializerInfoboxField
	if i.Blocks != nil {
		blocks = make([]*layer.InitializerInfoboxField, 0, len(i.Blocks))
		for _, f := range i.Blocks {
			if f2 := f.infoboxField(); f2 != nil {
				blocks = append(blocks, f2)
			}
		}
	}

	var pr *property.Initializer
	if i.Property != nil {
		pr = i.Property.property(builtin.PropertySchemaIDInfobox.Ref())
	}

	return &layer.InitializerInfobox{
		Property: pr,
		Fields:   blocks,
	}
}

type ReearthInfoboxField struct {
	Plugin    id.PluginID          `json:"plugin"`
	Extension id.PluginExtensionID `json:"extension"`
	Property  *ReearthProperty     `json:"property"`
}

func (f *ReearthInfoboxField) infoboxField() *layer.InitializerInfoboxField {
	if f == nil {
		return nil
	}

	var psid *id.PropertySchemaID
	{
		psid2, err := id.PropertySchemaIDFromExtension(f.Plugin, f.Extension)
		if err == nil {
			// if there is an error, property schema id will be nil.
			psid = psid2.Ref()
		}
	}

	var pr *property.Initializer
	if f.Property != nil {
		pr = f.Property.property(psid)
	}

	return &layer.InitializerInfoboxField{
		Plugin:    f.Plugin,
		Extension: f.Extension,
		Property:  pr,
	}
}

type ReearthProperty map[id.PropertySchemaGroupID]ReearthPropertyItem

func (p ReearthProperty) property(schema *id.PropertySchemaID) *property.Initializer {
	if schema == nil || p == nil {
		return nil
	}

	var items []*property.InitializerItem
	items = make([]*property.InitializerItem, 0, len(p))
	for k, i := range p {
		items = append(items, i.propertyItem(k))
	}

	return &property.Initializer{
		Schema: *schema,
		Items:  items,
	}
}

type ReearthPropertyItem struct {
	Groups []ReearthPropertyGroup `json:"groups"`
	Fields ReearthPropertyGroup   `json:"fields"`
}

func (p *ReearthPropertyItem) propertyItem(key id.PropertySchemaGroupID) *property.InitializerItem {
	if p == nil {
		return nil
	}

	if p.Groups != nil {
		groups := make([]*property.InitializerGroup, 0, len(p.Groups))
		for _, g := range p.Groups {
			if g == nil {
				continue
			}
			if g2 := g.propertyGroup(); g2 != nil {
				groups = append(groups, g2)
			}
		}

		return &property.InitializerItem{
			SchemaItem: key,
			Groups:     groups,
		}
	}

	var fields []*property.InitializerField
	if p.Fields != nil {
		fields = make([]*property.InitializerField, 0, len(p.Fields))
		for k, f := range p.Fields {
			if f2 := f.propertyField(k); f2 != nil {
				fields = append(fields, f2)
			}
		}
	}

	return &property.InitializerItem{
		SchemaItem: key,
		Fields:     fields,
	}
}

type ReearthPropertyGroup map[id.PropertySchemaFieldID]*ReearthPropertyField

func (p ReearthPropertyGroup) propertyGroup() *property.InitializerGroup {
	if p == nil || len(p) == 0 {
		return nil
	}

	var fields []*property.InitializerField
	fields = make([]*property.InitializerField, 0, len(p))
	for k, f := range p {
		if f2 := f.propertyField(k); f2 != nil {
			fields = append(fields, f2)
		}
	}

	return &property.InitializerGroup{
		Fields: fields,
	}
}

type ReearthPropertyField struct {
	Type  string                 `json:"type"`
	Links []*ReearthPropertyLink `json:"links"`
	Value interface{}            `json:"value"`
}

func (f *ReearthPropertyField) propertyField(key id.PropertySchemaFieldID) *property.InitializerField {
	if f == nil || f.Type == "" {
		return nil
	}

	v := property.ValueType(f.Type).ValueFrom(f.Value)
	if v == nil {
		return nil
	}

	var links []*property.InitializerLink
	if len(links) > 0 {
		links = make([]*property.InitializerLink, 0, len(f.Links))
		for _, l := range f.Links {
			links = append(links, &property.InitializerLink{
				Dataset: l.Dataset,
				Schema:  l.Schema,
				Field:   l.Field,
			})
		}
	}

	return &property.InitializerField{
		Field: key,
		Type:  v.Type(),
		Value: v,
		Links: links,
	}
}

type ReearthPropertyLink struct {
	Dataset *id.DatasetID           `json:"dataset"`
	Schema  id.DatasetSchemaID      `json:"schema"`
	Field   id.DatasetSchemaFieldID `json:"field"`
}
