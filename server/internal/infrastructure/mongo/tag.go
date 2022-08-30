package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/tag"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type tagRepo struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewTag(client *mongox.Client) repo.Tag {
	r := &tagRepo{client: client.WithCollection("tag")}
	r.init()
	return r
}

func (r *tagRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"scene", "group.tags", "item.parent"}, []string{"id"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "tag", i)
	}
}

func (r *tagRepo) Filtered(f repo.SceneFilter) repo.Tag {
	return &tagRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *tagRepo) FindByID(ctx context.Context, id id.TagID) (tag.Tag, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *tagRepo) FindByIDs(ctx context.Context, ids id.TagIDList) ([]*tag.Tag, error) {
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

func (r *tagRepo) FindByScene(ctx context.Context, id id.SceneID) ([]*tag.Tag, error) {
	if !r.f.CanRead(id) {
		return nil, nil
	}
	filter := bson.M{
		"scene": id.String(),
	}
	return r.find(ctx, filter)
}

func (r *tagRepo) FindItemByID(ctx context.Context, id id.TagID) (*tag.Item, error) {
	filter := bson.M{
		"id": id.String(),
	}
	return r.findItemOne(ctx, filter)
}

func (r *tagRepo) FindItemByIDs(ctx context.Context, ids id.TagIDList) ([]*tag.Item, error) {
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

func (r *tagRepo) FindGroupByID(ctx context.Context, id id.TagID) (*tag.Group, error) {
	filter := bson.M{
		"id": id.String(),
	}
	return r.findGroupOne(ctx, filter)
}

func (r *tagRepo) FindGroupByIDs(ctx context.Context, ids id.TagIDList) ([]*tag.Group, error) {
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

func (r *tagRepo) FindRootsByScene(ctx context.Context, id id.SceneID) ([]*tag.Tag, error) {
	return r.find(ctx, bson.M{
		"scene":       id.String(),
		"item.parent": nil,
	})
}

func (r *tagRepo) FindGroupByItem(ctx context.Context, tagID id.TagID) (*tag.Group, error) {
	return r.findGroupOne(ctx, bson.M{
		"group.tags": tagID.String(),
	})
}

func (r *tagRepo) Save(ctx context.Context, tag tag.Tag) error {
	if !r.f.CanWrite(tag.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, tid := mongodoc.NewTag(tag)
	return r.client.SaveOne(ctx, tid, doc)
}

func (r *tagRepo) SaveAll(ctx context.Context, tags []*tag.Tag) error {
	if tags == nil {
		return nil
	}
	docs, ids := mongodoc.NewTags(tags, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *tagRepo) Remove(ctx context.Context, id id.TagID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *tagRepo) RemoveAll(ctx context.Context, ids id.TagIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *tagRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	_, err := r.client.Client().DeleteMany(ctx, bson.M{
		"scene": sceneID.String(),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *tagRepo) find(ctx context.Context, filter any) ([]*tag.Tag, error) {
	c := mongodoc.NewTagConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return lo.ToSlicePtr(c.Result), nil
}

func (r *tagRepo) findOne(ctx context.Context, filter any) (tag.Tag, error) {
	c := mongodoc.NewTagConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.Result[0], nil
}

func (r *tagRepo) findItemOne(ctx context.Context, filter any) (*tag.Item, error) {
	c := mongodoc.NewTagConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return tag.ToTagItem(c.Result[0]), nil
}

func (r *tagRepo) findGroupOne(ctx context.Context, filter any) (*tag.Group, error) {
	c := mongodoc.NewTagConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return tag.ToTagGroup(c.Result[0]), nil
}

func (r *tagRepo) findItems(ctx context.Context, filter any) ([]*tag.Item, error) {
	c := mongodoc.NewTagConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return tag.List(c.Result).Items(), nil
}

func (r *tagRepo) findGroups(ctx context.Context, filter any) ([]*tag.Group, error) {
	c := mongodoc.NewTagConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c); err != nil {
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

func (r *tagRepo) readFilter(filter any) any {
	return applySceneFilter(filter, r.f.Readable)
}

func (r *tagRepo) writeFilter(filter any) any {
	return applySceneFilter(filter, r.f.Writable)
}
