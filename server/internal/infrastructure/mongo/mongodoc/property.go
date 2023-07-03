package mongodoc

import (
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/exp/slices"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/mongox"
)

const (
	typePropertyItemGroup     = "group"
	typePropertyItemGroupList = "grouplist"
)

type PropertyDocument struct {
	ID           string
	Scene        string
	Schema       string `bson:",omitempty"` // compatibility
	SchemaPlugin string
	SchemaName   string
	Items        []*PropertyItemDocument
}

type PropertyFieldDocument struct {
	Field string
	Type  string
	Links []*PropertyLinkDocument
	Value interface{}
}

type PropertyLinkDocument struct {
	Schema  *string
	Dataset *string
	Field   *string
}

type PropertyItemDocument struct {
	Type        string
	ID          string
	SchemaGroup string
	Groups      []*PropertyItemDocument
	Fields      []*PropertyFieldDocument
}

type PropertyConsumer = Consumer[*PropertyDocument, *property.Property]

func NewPropertyConsumer(scenes []id.SceneID) *PropertyConsumer {
	return NewConsumer[*PropertyDocument, *property.Property](func(a *property.Property) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

type PropertyBatchConsumer struct {
	Size     int
	Callback func([]*property.Property) error
	consumer *mongox.BatchConsumer
}

func (c *PropertyBatchConsumer) Consume(raw bson.Raw) error {
	if c.consumer == nil {
		c.consumer = &mongox.BatchConsumer{
			Size: c.Size,
			Callback: func(rows []bson.Raw) error {
				properties := make([]*property.Property, 0, len(rows))

				for _, r := range rows {
					var doc PropertyDocument
					if err := bson.Unmarshal(r, &doc); err != nil {
						return err
					}
					property, err := doc.Model()
					if err != nil {
						return err
					}

					properties = append(properties, property)
				}

				return c.Callback(properties)
			},
		}
	}

	return c.consumer.Consume(raw)
}

func newPropertyField(f *property.Field) *PropertyFieldDocument {
	if f == nil {
		return nil
	}

	field := &PropertyFieldDocument{
		Field: string(f.Field()),
		Type:  string(f.Type()),
		Value: f.Value().Interface(),
	}

	if links := f.Links().Links(); links != nil {
		field.Links = make([]*PropertyLinkDocument, 0, len(links))
		for _, l := range links {
			field.Links = append(field.Links, &PropertyLinkDocument{
				Schema:  l.DatasetSchema().StringRef(),
				Dataset: l.Dataset().StringRef(),
				Field:   l.DatasetSchemaField().StringRef(),
			})
		}
	}

	return field
}

func newPropertyItem(f property.Item) *PropertyItemDocument {
	if f == nil {
		return nil
	}

	t := ""
	var items []*PropertyItemDocument
	var fields []*PropertyFieldDocument

	if g := property.ToGroup(f); g != nil {
		t = typePropertyItemGroup
		pfields := g.Fields(nil)
		fields = make([]*PropertyFieldDocument, 0, len(pfields))
		for _, r := range pfields {
			fields = append(fields, newPropertyField(r))
		}
	} else if g := property.ToGroupList(f); g != nil {
		t = typePropertyItemGroupList
		pgroups := g.Groups()
		items = make([]*PropertyItemDocument, 0, len(pgroups))
		for _, r := range pgroups {
			items = append(items, newPropertyItem(r))
		}
	}

	return &PropertyItemDocument{
		Type:        t,
		ID:          f.ID().String(),
		SchemaGroup: string(f.SchemaGroup()),
		Groups:      items,
		Fields:      fields,
	}
}

func NewProperty(property *property.Property) (*PropertyDocument, string) {
	if property == nil {
		return nil, ""
	}

	pid := property.ID().String()
	items := property.Items()
	doc := PropertyDocument{
		ID:           pid,
		SchemaPlugin: property.Schema().Plugin().String(),
		SchemaName:   property.Schema().ID(),
		Items:        make([]*PropertyItemDocument, 0, len(items)),
		Scene:        property.Scene().String(),
	}
	for _, f := range items {
		doc.Items = append(doc.Items, newPropertyItem(f))
	}
	return &doc, pid
}

func NewProperties(properties []*property.Property, f scene.IDList) ([]interface{}, []string) {
	if properties == nil {
		return nil, nil
	}

	res := make([]interface{}, 0, len(properties))
	ids := make([]string, 0, len(properties))
	for _, d := range properties {
		if d == nil || f != nil && !f.Has(d.Scene()) {
			continue
		}
		r, id := NewProperty(d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

func toModelPropertyField(f *PropertyFieldDocument) *property.Field {
	if f == nil {
		return nil
	}

	var flinks *property.Links
	if f.Links != nil {
		links := make([]*property.Link, 0, len(f.Links))
		for _, l := range f.Links {
			var link *property.Link
			d := id.DatasetIDFromRef(l.Dataset)
			ds := id.DatasetSchemaIDFromRef(l.Schema)
			df := id.DatasetFieldIDFromRef(l.Field)
			if d != nil && ds != nil && df != nil {
				link = property.NewLink(*d, *ds, *df)
			} else if ds != nil && df != nil {
				link = property.NewLinkFieldOnly(*ds, *df)
			} else {
				continue
			}
			links = append(links, link)
		}
		flinks = property.NewLinks(links)
	}

	vt := property.ValueType(f.Type)
	field := property.NewField(property.FieldID(f.Field)).
		Value(property.NewOptionalValue(vt, toModelPropertyValue(f.Value, f.Type))).
		Links(flinks).
		Build()

	return field
}

func toModelPropertyItem(f *PropertyItemDocument) (property.Item, error) {
	if f == nil {
		return nil, nil
	}

	var i property.Item
	var err error
	var iid id.PropertyItemID

	iid, err = id.PropertyItemIDFrom(f.ID)
	if err != nil {
		return nil, err
	}
	gid := id.PropertySchemaGroupID(f.SchemaGroup)

	if f.Type == typePropertyItemGroup {
		fields := make([]*property.Field, 0, len(f.Fields))
		for _, i := range f.Fields {
			fields = append(fields, toModelPropertyField(i))
		}

		i, err = property.NewGroup().
			ID(iid).
			SchemaGroup(gid).
			Fields(fields).
			Build()
	} else if f.Type == typePropertyItemGroupList {
		items := make([]*property.Group, 0, len(f.Groups))
		for _, i := range f.Groups {
			i2, err := toModelPropertyItem(i)
			if err != nil {
				return nil, err
			}
			if i3 := property.ToGroup(i2); i3 != nil {
				items = append(items, i3)
			}
		}

		i, err = property.NewGroupList().
			ID(iid).
			SchemaGroup(gid).
			Groups(items).
			Build()
	}

	return i, err
}

func (doc *PropertyDocument) Model() (*property.Property, error) {
	if doc == nil {
		return nil, nil
	}

	pid, err := id.PropertyIDFrom(doc.ID)
	if err != nil {
		return nil, err
	}
	sid, err := id.SceneIDFrom(doc.Scene)
	if err != nil {
		return nil, err
	}
	pl, err := id.PluginIDFrom(doc.SchemaPlugin)
	if err != nil {
		return nil, err
	}

	items := make([]property.Item, 0, len(doc.Items))
	for _, f := range doc.Items {
		i, err := toModelPropertyItem(f)
		if err != nil {
			return nil, err
		}
		items = append(items, i)
	}

	return property.New().
		ID(pid).
		Scene(sid).
		Schema(id.NewPropertySchemaID(pl, doc.SchemaName)).
		Items(items).
		Build()
}

func toModelPropertyValue(v interface{}, t string) *property.Value {
	return property.ValueType(t).ValueFrom(mongox.DToM(v))
}
