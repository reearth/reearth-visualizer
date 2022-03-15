package mongodoc

import (
	"errors"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/tag"
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

type TagConsumer struct {
	Rows      []*tag.Tag
	GroupRows []*tag.Group
	ItemRows  []*tag.Item
}

func (c *TagConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc TagDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	ti, tg, err := doc.Model()
	if err != nil {
		return err
	}
	if ti != nil {
		var t tag.Tag = ti
		c.Rows = append(c.Rows, &t)
		c.ItemRows = append(c.ItemRows, ti)
	}
	if tg != nil {
		var t tag.Tag = tg
		c.Rows = append(c.Rows, &t)
		c.GroupRows = append(c.GroupRows, tg)
	}
	return nil
}

func NewTag(t tag.Tag) (*TagDocument, string) {
	var group *TagGroupDocument
	var item *TagItemDocument
	if tg := tag.GroupFrom(t); tg != nil {
		tags := tg.Tags()
		ids := tags.Tags()

		group = &TagGroupDocument{
			Tags: id.TagIDsToStrings(ids),
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
		if f != nil && !f.Includes(d2.Scene()) {
			continue
		}
		r, tid := NewTag(d2)
		res = append(res, r)
		ids = append(ids, tid)
	}
	return res, ids
}

func (d *TagDocument) Model() (*tag.Item, *tag.Group, error) {
	if d.Item != nil {
		ti, err := d.ModelItem()
		if err != nil {
			return nil, nil, err
		}
		return ti, nil, nil
	}

	if d.Group != nil {
		tg, err := d.ModelGroup()
		if err != nil {
			return nil, nil, err
		}
		return nil, tg, nil
	}

	return nil, nil, errors.New("invalid tag")
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
		LinkedDatasetFieldID(id.DatasetSchemaFieldIDFromRef(d.Item.LinkedDatasetFieldID)).
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

	ids := make([]id.TagID, 0, len(d.Group.Tags))
	for _, lgid := range d.Group.Tags {
		tagId, err := id.TagIDFrom(lgid)
		if err != nil {
			return nil, err
		}
		ids = append(ids, tagId)
	}

	return tag.NewGroup().
		ID(tid).
		Label(d.Label).
		Scene(sid).
		Tags(tag.IDListFrom(ids)).
		Build()
}
