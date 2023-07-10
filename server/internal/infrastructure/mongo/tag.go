package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/tag"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	tagIndexes       = []string{"scene", "group.tags", "item.parent"}
	tagUniqueIndexes = []string{"id"}
)

type Tag struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewTag(client *mongox.Client) *Tag {
	return &Tag{
		client: client.WithCollection("tag"),
	}
}

func (r *Tag) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, tagIndexes, tagUniqueIndexes)
}

func (r *Tag) Filtered(f repo.SceneFilter) repo.Tag {
	return &Tag{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Tag) FindByID(ctx context.Context, id id.TagID) (tag.Tag, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Tag) FindByIDs(ctx context.Context, ids id.TagIDList) ([]*tag.Tag, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterTags(ids, res), nil
}

func (r *Tag) FindByScene(ctx context.Context, id id.SceneID) ([]*tag.Tag, error) {
	if !r.f.CanRead(id) {
		return nil, nil
	}
	filter := bson.M{
		"scene": id.String(),
	}
	return r.find(ctx, filter)
}

func (r *Tag) FindItemByID(ctx context.Context, id id.TagID) (*tag.Item, error) {
	filter := bson.M{
		"id": id.String(),
	}
	return r.findItemOne(ctx, filter)
}

func (r *Tag) FindItemByIDs(ctx context.Context, ids id.TagIDList) ([]*tag.Item, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.findItems(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterTagItems(ids, res), nil
}

func (r *Tag) FindGroupByID(ctx context.Context, id id.TagID) (*tag.Group, error) {
	filter := bson.M{
		"id": id.String(),
	}
	return r.findGroupOne(ctx, filter)
}

func (r *Tag) FindGroupByIDs(ctx context.Context, ids id.TagIDList) ([]*tag.Group, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.findGroups(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterTagGroups(ids, res), nil
}

func (r *Tag) FindRootsByScene(ctx context.Context, id id.SceneID) ([]*tag.Tag, error) {
	return r.find(ctx, bson.M{
		"scene":       id.String(),
		"item.parent": nil,
	})
}

func (r *Tag) FindGroupByItem(ctx context.Context, tagID id.TagID) (*tag.Group, error) {
	return r.findGroupOne(ctx, bson.M{
		"group.tags": tagID.String(),
	})
}

func (r *Tag) Save(ctx context.Context, tag tag.Tag) error {
	if !r.f.CanWrite(tag.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, tid := mongodoc.NewTag(tag)
	return r.client.SaveOne(ctx, tid, doc)
}

func (r *Tag) SaveAll(ctx context.Context, tags []*tag.Tag) error {
	if tags == nil {
		return nil
	}
	docs, ids := mongodoc.NewTags(tags, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *Tag) Remove(ctx context.Context, id id.TagID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Tag) RemoveAll(ctx context.Context, ids id.TagIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *Tag) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	_, err := r.client.Client().DeleteMany(ctx, bson.M{
		"scene": sceneID.String(),
	})
	if err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}
	return nil
}

func (r *Tag) find(ctx context.Context, filter any) ([]*tag.Tag, error) {
	c := mongodoc.NewTagConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return lo.ToSlicePtr(c.Result), nil
}

func (r *Tag) findOne(ctx context.Context, filter any) (tag.Tag, error) {
	c := mongodoc.NewTagConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.Result[0], nil
}

func (r *Tag) findItemOne(ctx context.Context, filter any) (*tag.Item, error) {
	c := mongodoc.NewTagConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return tag.ToTagItem(c.Result[0]), nil
}

func (r *Tag) findGroupOne(ctx context.Context, filter any) (*tag.Group, error) {
	c := mongodoc.NewTagConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return tag.ToTagGroup(c.Result[0]), nil
}

func (r *Tag) findItems(ctx context.Context, filter any) ([]*tag.Item, error) {
	c := mongodoc.NewTagConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return tag.List(c.Result).Items(), nil
}

func (r *Tag) findGroups(ctx context.Context, filter any) ([]*tag.Group, error) {
	c := mongodoc.NewTagConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return tag.List(c.Result).Groups(), nil
}

func filterTags(ids id.TagIDList, rows []*tag.Tag) []*tag.Tag {
	res := make([]*tag.Tag, 0, len(ids))
	for _, tid := range ids {
		var r2 *tag.Tag
		for _, r := range rows {
			if r == nil {
				continue
			}
			if r3 := *r; r3 != nil && r3.ID() == tid {
				r2 = &r3
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func filterTagItems(ids id.TagIDList, rows []*tag.Item) []*tag.Item {
	res := make([]*tag.Item, 0, len(ids))
	for _, tid := range ids {
		var r2 *tag.Item
		for _, r := range rows {
			if r != nil && r.ID() == tid {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func filterTagGroups(ids id.TagIDList, rows []*tag.Group) []*tag.Group {
	res := make([]*tag.Group, 0, len(ids))
	for _, tid := range ids {
		var r2 *tag.Group
		for _, r := range rows {
			if r != nil && r.ID() == tid {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

// func (r *Tag) readFilter(filter any) any {
// 	return applySceneFilter(filter, r.f.Readable)
// }

func (r *Tag) writeFilter(filter any) any {
	return applySceneFilter(filter, r.f.Writable)
}
