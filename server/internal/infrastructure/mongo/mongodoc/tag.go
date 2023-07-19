package mongodoc

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/tag"
	"golang.org/x/exp/slices"
)

type TagDocument struct {
	ID    string
	Label string
	Scene string
	Item  *TagItemDocument
	Group *TagGroupDocument
}

type TagItemDocument struct {
	Parent                *string
	LinkedDatasetFieldID  *string
	LinkedDatasetID       *string
	LinkedDatasetSchemaID *string
}

type TagGroupDocument struct {
	Tags []string
}

type TagConsumer = Consumer[*TagDocument, tag.Tag]

func NewTagConsumer(scenes []id.SceneID) *TagConsumer {
	return NewConsumer[*TagDocument, tag.Tag](func(a tag.Tag) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

func NewTag(t tag.Tag) (*TagDocument, string) {
	var group *TagGroupDocument
	var item *TagItemDocument
	if tg := tag.GroupFrom(t); tg != nil {
		group = &TagGroupDocument{
			Tags: tg.Tags().Strings(),
		}
	}

	if ti := tag.ItemFrom(t); ti != nil {
		item = &TagItemDocument{
			Parent:                ti.Parent().StringRef(),
			LinkedDatasetFieldID:  ti.LinkedDatasetFieldID().StringRef(),
			LinkedDatasetID:       ti.LinkedDatasetID().StringRef(),
			LinkedDatasetSchemaID: ti.LinkedDatasetSchemaID().StringRef(),
		}
	}

	tid := t.ID().String()
	return &TagDocument{
		ID:    tid,
		Label: t.Label(),
		Scene: t.Scene().String(),
		Item:  item,
		Group: group,
	}, tid
}

func NewTags(tags []*tag.Tag, f scene.IDList) ([]interface{}, []string) {
	res := make([]interface{}, 0, len(tags))
	ids := make([]string, 0, len(tags))
	for _, d := range tags {
		if d == nil {
			continue
		}
		d2 := *d
		if f != nil && !f.Has(d2.Scene()) {
			continue
		}
		r, tid := NewTag(d2)
		res = append(res, r)
		ids = append(ids, tid)
	}
	return res, ids
}

func (d *TagDocument) Model() (tag.Tag, error) {
	if d.Item != nil {
		ti, err := d.ModelItem()
		if err != nil {
			return nil, err
		}
		return ti, nil
	}

	if d.Group != nil {
		tg, err := d.ModelGroup()
		if err != nil {
			return nil, err
		}
		return tg, nil
	}

	return nil, errors.New("invalid tag")
}

func (d *TagDocument) ModelItem() (*tag.Item, error) {
	if d.Item == nil {
		return nil, nil
	}

	tid, err := id.TagIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	sid, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}

	return tag.NewItem().
		ID(tid).
		Label(d.Label).
		Scene(sid).
		Parent(id.TagIDFromRef(d.Item.Parent)).
		LinkedDatasetSchemaID(id.DatasetSchemaIDFromRef(d.Item.LinkedDatasetSchemaID)).
		LinkedDatasetID(id.DatasetIDFromRef(d.Item.LinkedDatasetID)).
		LinkedDatasetFieldID(id.DatasetFieldIDFromRef(d.Item.LinkedDatasetFieldID)).
		Build()
}

func (d *TagDocument) ModelGroup() (*tag.Group, error) {
	if d.Group == nil {
		return nil, nil
	}

	tid, err := id.TagIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	sid, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}

	tags, err := id.TagIDListFrom(d.Group.Tags)
	if err != nil {
		return nil, err
	}

	return tag.NewGroup().
		ID(tid).
		Label(d.Label).
		Scene(sid).
		Tags(tags).
		Build()
}
