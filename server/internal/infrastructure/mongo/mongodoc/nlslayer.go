package mongodoc

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/scene"
	"golang.org/x/exp/slices"
)

type NLSLayerDocument struct {
	ID        string
	Title     string
	Visible   bool
	Scene     string
	LayerType string
	Infobox   *LayerInfoboxDocument
	Simple    *NLSLayerSimpleDocument
	Group     *NLSLayerGroupDocument
	Tags      LayerTagListDocument
}

type NLSLayerSimpleDocument struct {
	Config map[string]any
}

type NLSLayerGroupDocument struct {
	Children []string
	Root     bool
	Config   map[string]any
}

type NLSLayerConsumer = Consumer[*NLSLayerDocument, nlslayer.NLSLayer]

func NewNLSLayerConsumer(scenes []id.SceneID) *NLSLayerConsumer {
	return NewConsumer[*NLSLayerDocument, nlslayer.NLSLayer](func(a nlslayer.NLSLayer) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

func NewNLSLayer(l nlslayer.NLSLayer) (*NLSLayerDocument, string) {
	var group *NLSLayerGroupDocument
	var simple *NLSLayerSimpleDocument
	var infobox *LayerInfoboxDocument

	if lg := nlslayer.NLSLayerGroupFromLayer(l); lg != nil {
		group = &NLSLayerGroupDocument{
			Children: lg.Children().Strings(),
			Root:     lg.IsRoot(),
			Config:   *lg.Config(),
		}
	}

	if ls := nlslayer.NLSLayerSimpleFromLayer(l); ls != nil {
		simple = &NLSLayerSimpleDocument{
			Config: *ls.Config(),
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
	return &NLSLayerDocument{
		ID:        id,
		Title:     l.Title(),
		Visible:   l.IsVisible(),
		Scene:     l.Scene().String(),
		Infobox:   infobox,
		LayerType: string(l.LayerType()),
		Group:     group,
		Simple:    simple,
		Tags:      NewLayerTagList(l.Tags()),
	}, id
}

func NewNLSLayers(layers nlslayer.NLSLayerList, f scene.IDList) ([]interface{}, []string) {
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
		r, id := NewNLSLayer(d2)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

func (d *NLSLayerDocument) Model() (nlslayer.NLSLayer, error) {
	if d.Simple != nil {
		li, err := d.ModelSimple()
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

func (d *NLSLayerDocument) ModelSimple() (*nlslayer.NLSLayerSimple, error) {
	lid, err := id.NLSLayerIDFrom(d.ID)
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

	return nlslayer.NewNLSLayerSimple().
		ID(lid).
		Title(d.Title).
		LayerType(NewNLSLayerType(d.LayerType)).
		IsVisible(d.Visible).
		Infobox(ib).
		Scene(sid).
		Tags(d.Tags.Model()).
		// Simple
		Config(NewNLSLayerConfig(d.Simple.Config)).
		Build()
}

func (d *NLSLayerDocument) ModelGroup() (*nlslayer.NLSLayerGroup, error) {
	lid, err := id.NLSLayerIDFrom(d.ID)
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

	ids := make([]id.NLSLayerID, 0, len(d.Group.Children))
	for _, lgid := range d.Group.Children {
		lid, err := id.NLSLayerIDFrom(lgid)
		if err != nil {
			return nil, err
		}
		ids = append(ids, lid)
	}

	return nlslayer.NewNLSLayerGroup().
		ID(lid).
		Title(d.Title).
		LayerType(NewNLSLayerType(d.LayerType)).
		IsVisible(d.Visible).
		Infobox(ib).
		Scene(sid).
		Tags(d.Tags.Model()).
		// group
		Root(d.Group != nil && d.Group.Root).
		Layers(nlslayer.NewIDList(ids)).
		Config(NewNLSLayerConfig(d.Simple.Config)).
		Build()
}

func NewNLSLayerType(p string) nlslayer.LayerType {
	lt, err := nlslayer.NewLayerType(p)
	if err != nil {
		return nlslayer.LayerType("")
	}
	return lt
}

func NewNLSLayerConfig(c map[string]any) *nlslayer.Config {
	config := nlslayer.Config(c)
	return &config
}
