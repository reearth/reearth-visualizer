package mongodoc

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/scene"
	"golang.org/x/exp/slices"
)

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
	Tags      LayerTagListDocument
}

type LayerItemDocument struct {
	LinkedDataset *string
}

type LayerGroupDocument struct {
	Layers              []string
	LinkedDatasetSchema *string
	Root                bool
}

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

type LayerTagDocument struct {
	ID    string
	Group bool
	Tags  []LayerTagDocument
}

type LayerTagListDocument []LayerTagDocument

type LayerConsumer = Consumer[*LayerDocument, layer.Layer]

func NewLayerConsumer(scenes []id.SceneID) *LayerConsumer {
	return NewConsumer[*LayerDocument, layer.Layer](func(a layer.Layer) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

func NewLayer(l layer.Layer) (*LayerDocument, string) {
	var group *LayerGroupDocument
	var item *LayerItemDocument
	var infobox *LayerInfoboxDocument

	if lg := layer.GroupFromLayer(l); lg != nil {
		group = &LayerGroupDocument{
			Layers:              lg.Layers().Strings(),
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
		Tags:      NewLayerTagList(l.Tags()),
	}, id
}

func NewLayers(layers layer.List, f scene.IDList) ([]interface{}, []string) {
	res := make([]interface{}, 0, len(layers))
	ids := make([]string, 0, len(layers))
	for _, d := range layers {
		if d == nil {
			continue
		}
		d2 := *d
		if d2 == nil || f != nil && !f.Has(d2.Scene()) {
			continue
		}
		r, id := NewLayer(d2)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

func (d *LayerDocument) Model() (layer.Layer, error) {
	if d.Item != nil {
		li, err := d.ModelItem()
		if err != nil {
			return nil, err
		}
		return li, nil
	}
	if d.Group != nil {
		lg, err := d.ModelGroup()
		if err != nil {
			return nil, err
		}
		return lg, nil
	}
	return nil, errors.New("invalid layer")
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

	return layer.NewItem().
		ID(lid).
		Name(d.Name).
		IsVisible(d.Visible).
		Plugin(id.PluginIDFromRef(d.Plugin)).
		Extension(id.PluginExtensionIDFromRef(d.Extension)).
		Property(id.PropertyIDFromRef(d.Property)).
		Infobox(ib).
		Scene(sid).
		Tags(d.Tags.Model()).
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

	return layer.NewGroup().
		ID(lid).
		Name(d.Name).
		IsVisible(d.Visible).
		Plugin(id.PluginIDFromRef(d.Plugin)).
		Extension(id.PluginExtensionIDFromRef(d.Extension)).
		Property(id.PropertyIDFromRef(d.Property)).
		Infobox(ib).
		Scene(sid).
		Tags(d.Tags.Model()).
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

func NewLayerTagList(list *layer.TagList) LayerTagListDocument {
	if list.IsEmpty() {
		return nil
	}

	tags := list.Tags()
	if len(tags) == 0 {
		return nil
	}
	res := make([]LayerTagDocument, 0, len(tags))
	for _, t := range tags {
		if t == nil {
			return nil
		}
		if td := NewLayerTag(t); td != nil {
			res = append(res, *td)
		}
	}
	return res
}

func (d *LayerTagListDocument) Model() *layer.TagList {
	if d == nil {
		return nil
	}

	tags := make([]layer.Tag, 0, len(*d))
	for _, t := range *d {
		if ti := t.Model(); ti != nil {
			tags = append(tags, ti)
		}
	}
	return layer.NewTagList(tags)
}

func NewLayerTag(t layer.Tag) *LayerTagDocument {
	var group bool
	var tags []LayerTagDocument

	if tg := layer.TagGroupFrom(t); tg != nil {
		group = true
		children := tg.Children()
		tags = make([]LayerTagDocument, 0, len(children))
		for _, c := range children {
			if ct := NewLayerTag(c); ct != nil {
				tags = append(tags, *ct)
			}
		}
	} else if ti := layer.TagItemFrom(t); ti == nil {
		return nil
	}
	return &LayerTagDocument{
		ID:    t.ID().String(),
		Group: group,
		Tags:  tags,
	}
}

func (d *LayerTagDocument) Model() layer.Tag {
	if d == nil {
		return nil
	}

	tid := id.TagIDFromRef(&d.ID)
	if tid == nil {
		return nil
	}

	if d.Group {
		tags := make([]*layer.TagItem, 0, len(d.Tags))
		for _, t := range d.Tags {
			if ti := layer.TagItemFrom(t.Model()); ti != nil {
				tags = append(tags, ti)
			}
		}
		return layer.NewTagGroup(*tid, tags)
	}
	return layer.NewTagItem(*tid)
}
