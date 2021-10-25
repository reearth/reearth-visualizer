package mongodoc

import (
	"errors"

	"github.com/reearth/reearth-backend/pkg/tag"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
)

type LayerInfoboxFieldDocument struct {
	ID        string
	Plugin    string
	Extension string
	Property  string
}

type LayerInfoboxDocument struct {
	Property string
	Fields   []LayerInfoboxFieldDocument
}

type LayerItemDocument struct {
	LinkedDataset *string
}

type LayerGroupDocument struct {
	Layers              []string
	LinkedDatasetSchema *string
	Root                bool
}

type LayerDocument struct {
	ID        string
	Name      string
	Visible   bool
	Scene     string
	Plugin    *string
	Extension *string
	Property  *string
	Infobox   *LayerInfoboxDocument
	Item      *LayerItemDocument
	Group     *LayerGroupDocument
	Tags      []string
}

type LayerConsumer struct {
	Rows      []*layer.Layer
	GroupRows []*layer.Group
	ItemRows  []*layer.Item
}

func (c *LayerConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc LayerDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	li, lg, err := doc.Model()
	if err != nil {
		return err
	}
	if li != nil {
		var layer layer.Layer = li
		c.Rows = append(c.Rows, &layer)
		c.ItemRows = append(c.ItemRows, li)
	}
	if lg != nil {
		var layer layer.Layer = lg
		c.Rows = append(c.Rows, &layer)
		c.GroupRows = append(c.GroupRows, lg)
	}
	return nil
}

func NewLayer(l layer.Layer) (*LayerDocument, string) {
	var group *LayerGroupDocument
	var item *LayerItemDocument
	var infobox *LayerInfoboxDocument

	if lg := layer.GroupFromLayer(l); lg != nil {
		group = &LayerGroupDocument{
			Layers:              id.LayerIDToKeys(lg.Layers().Layers()),
			LinkedDatasetSchema: lg.LinkedDatasetSchema().StringRef(),
			Root:                lg.IsRoot(),
		}
	}

	if li := layer.ItemFromLayer(l); li != nil {
		item = &LayerItemDocument{
			LinkedDataset: li.LinkedDataset().StringRef(),
		}
	}

	if ib := l.Infobox(); ib != nil {
		ibfields := ib.Fields()
		fields := make([]LayerInfoboxFieldDocument, 0, len(ibfields))
		for _, f := range ibfields {
			fields = append(fields, LayerInfoboxFieldDocument{
				ID:        f.ID().String(),
				Plugin:    f.Plugin().String(),
				Extension: string(f.Extension()),
				Property:  f.Property().String(),
			})
		}
		infobox = &LayerInfoboxDocument{
			Property: ib.Property().String(),
			Fields:   fields,
		}
	}
	var tagIDs []string
	tags := l.Tags()
	for _, tid := range tags.Tags() {
		tagIDs = append(tagIDs, tid.String())
	}
	id := l.ID().String()
	return &LayerDocument{
		ID:        id,
		Name:      l.Name(),
		Visible:   l.IsVisible(),
		Scene:     l.Scene().String(),
		Infobox:   infobox,
		Group:     group,
		Item:      item,
		Plugin:    l.Plugin().StringRef(),
		Extension: l.Extension().StringRef(),
		Property:  l.Property().StringRef(),
		Tags:      tagIDs,
	}, id
}

func NewLayers(layers layer.List) ([]interface{}, []string) {
	res := make([]interface{}, 0, len(layers))
	ids := make([]string, 0, len(layers))
	for _, d := range layers {
		if d == nil {
			continue
		}
		r, id := NewLayer(*d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

func (d *LayerDocument) Model() (*layer.Item, *layer.Group, error) {
	if d.Item != nil {
		li, err := d.ModelItem()
		if err != nil {
			return nil, nil, err
		}
		return li, nil, nil
	}
	if d.Group != nil {
		lg, err := d.ModelGroup()
		if err != nil {
			return nil, nil, err
		}
		return nil, lg, nil
	}
	return nil, nil, errors.New("invalid layer")
}

func (d *LayerDocument) ModelItem() (*layer.Item, error) {
	lid, err := id.LayerIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	sid, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}
	ib, err2 := ToModelInfobox(d.Infobox)
	if err2 != nil {
		return nil, err
	}

	tids, err := id.TagIDsFrom(d.Tags)
	if err != nil {
		return nil, err
	}
	tagList := tag.NewListFromTags(tids)

	return layer.NewItem().
		ID(lid).
		Name(d.Name).
		IsVisible(d.Visible).
		Plugin(id.PluginIDFromRef(d.Plugin)).
		Extension(id.PluginExtensionIDFromRef(d.Extension)).
		Property(id.PropertyIDFromRef(d.Property)).
		Infobox(ib).
		Scene(sid).
		Tags(tagList).
		// item
		LinkedDataset(id.DatasetIDFromRef(d.Item.LinkedDataset)).
		Build()
}

func (d *LayerDocument) ModelGroup() (*layer.Group, error) {
	lid, err := id.LayerIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	sid, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}
	ib, err2 := ToModelInfobox(d.Infobox)
	if err2 != nil {
		return nil, err2
	}

	ids := make([]id.LayerID, 0, len(d.Group.Layers))
	for _, lgid := range d.Group.Layers {
		lid, err := id.LayerIDFrom(lgid)
		if err != nil {
			return nil, err
		}
		ids = append(ids, lid)
	}

	tids, err := id.TagIDsFrom(d.Tags)
	if err != nil {
		return nil, err
	}
	tagList := tag.NewListFromTags(tids)

	return layer.NewGroup().
		ID(lid).
		Name(d.Name).
		IsVisible(d.Visible).
		Plugin(id.PluginIDFromRef(d.Plugin)).
		Extension(id.PluginExtensionIDFromRef(d.Extension)).
		Property(id.PropertyIDFromRef(d.Property)).
		Infobox(ib).
		Scene(sid).
		Tags(tagList).
		// group
		Root(d.Group != nil && d.Group.Root).
		Layers(layer.NewIDList(ids)).
		LinkedDatasetSchema(id.DatasetSchemaIDFromRef(d.Group.LinkedDatasetSchema)).
		Build()
}

func ToModelInfobox(ib *LayerInfoboxDocument) (*layer.Infobox, error) {
	if ib == nil {
		return nil, nil
	}
	pid, err := id.PropertyIDFrom(ib.Property)
	if err != nil {
		return nil, err
	}
	fields := make([]*layer.InfoboxField, 0, len(ib.Fields))
	for _, f := range ib.Fields {
		iid, err := id.InfoboxFieldIDFrom(f.ID)
		if err != nil {
			return nil, err
		}
		pid, err := id.PluginIDFrom(f.Plugin)
		if err != nil {
			return nil, err
		}
		prid, err := id.PropertyIDFrom(f.Property)
		if err != nil {
			return nil, err
		}
		ibf, err := layer.NewInfoboxField().
			ID(iid).
			Plugin(pid).
			Extension(id.PluginExtensionID(f.Extension)).
			Property(prid).
			Build()
		if err != nil {
			return nil, err
		}
		fields = append(fields, ibf)
	}
	return layer.NewInfobox(fields, pid), nil
}
