package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/tag"
)

type tagRepo struct {
	client *mongodoc.ClientCollection
}

func NewTag(client *mongodoc.Client) repo.Tag {
	r := &tagRepo{client: client.WithCollection("tag")}
	r.init()
	return r
}

func (r *tagRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"scene", "group.tags", "item.parent"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "tag", i)
	}
}

func (r *tagRepo) FindByID(ctx context.Context, id id.TagID, f []id.SceneID) (tag.Tag, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: id.String()},
	}, f)
	return r.findOne(ctx, filter)
}

func (r *tagRepo) FindByIDs(ctx context.Context, ids []id.TagID, f []id.SceneID) ([]*tag.Tag, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.TagIDsToStrings(ids)},
		}},
	}, f)
	dst := make([]*tag.Tag, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterTags(ids, res), nil
}

func (r *tagRepo) FindItemByID(ctx context.Context, id id.TagID, f []id.SceneID) (*tag.Item, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: id.String()},
	}, f)
	return r.findItemOne(ctx, filter)
}

func (r *tagRepo) FindItemByIDs(ctx context.Context, ids []id.TagID, f []id.SceneID) ([]*tag.Item, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.TagIDsToStrings(ids)},
		}},
	}, f)
	dst := make([]*tag.Item, 0, len(ids))
	res, err := r.findItems(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterTagItems(ids, res), nil
}

func (r *tagRepo) FindGroupByID(ctx context.Context, id id.TagID, f []id.SceneID) (*tag.Group, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: id.String()},
	}, f)
	return r.findGroupOne(ctx, filter)
}

func (r *tagRepo) FindGroupByIDs(ctx context.Context, ids []id.TagID, f []id.SceneID) ([]*tag.Group, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.TagIDsToStrings(ids)},
		}},
	}, f)
	dst := make([]*tag.Group, 0, len(ids))
	res, err := r.findGroups(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterTagGroups(ids, res), nil
}

func (r *tagRepo) FindRootsByScene(ctx context.Context, id id.SceneID) ([]*tag.Tag, error) {
	filter := bson.M{
		"scene":       id.String(),
		"item.parent": nil,
	}
	return r.find(ctx, nil, filter)
}

func (r *tagRepo) FindGroupByItem(ctx context.Context, tagID id.TagID, f []id.SceneID) (*tag.Group, error) {
	ids := []id.TagID{tagID}
	filter := r.sceneFilter(bson.D{
		{Key: "group.tags", Value: bson.D{
			{Key: "$in", Value: id.TagIDsToStrings(ids)},
		}},
	}, f)

	return r.findGroupOne(ctx, filter)
}

func (r *tagRepo) Save(ctx context.Context, tag tag.Tag) error {
	doc, tid := mongodoc.NewTag(tag)
	return r.client.SaveOne(ctx, tid, doc)
}

func (r *tagRepo) SaveAll(ctx context.Context, tags []*tag.Tag) error {
	if tags == nil {
		return nil
	}
	docs, ids := mongodoc.NewTags(tags)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *tagRepo) Remove(ctx context.Context, id id.TagID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *tagRepo) RemoveAll(ctx context.Context, ids []id.TagID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, id.TagIDsToStrings(ids))
}

func (r *tagRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	_, err := r.client.Collection().DeleteMany(ctx, filter)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *tagRepo) find(ctx context.Context, dst []*tag.Tag, filter interface{}) ([]*tag.Tag, error) {
	c := mongodoc.TagConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *tagRepo) findOne(ctx context.Context, filter interface{}) (tag.Tag, error) {
	c := mongodoc.TagConsumer{}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	if len(c.Rows) == 0 {
		return nil, rerror.ErrNotFound
	}
	return *c.Rows[0], nil
}

func (r *tagRepo) findItemOne(ctx context.Context, filter bson.D) (*tag.Item, error) {
	c := mongodoc.TagConsumer{}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	if len(c.ItemRows) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.ItemRows[0], nil
}

func (r *tagRepo) findGroupOne(ctx context.Context, filter bson.D) (*tag.Group, error) {
	c := mongodoc.TagConsumer{}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	if len(c.GroupRows) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.GroupRows[0], nil
}

func (r *tagRepo) findItems(ctx context.Context, dst []*tag.Item, filter bson.D) ([]*tag.Item, error) {
	c := mongodoc.TagConsumer{
		ItemRows: dst,
	}
	if c.ItemRows != nil {
		c.Rows = make([]*tag.Tag, 0, len(c.ItemRows))
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.ItemRows, nil
}

func (r *tagRepo) findGroups(ctx context.Context, dst []*tag.Group, filter bson.D) ([]*tag.Group, error) {
	c := mongodoc.TagConsumer{
		GroupRows: dst,
	}
	if c.GroupRows != nil {
		c.Rows = make([]*tag.Tag, 0, len(c.GroupRows))
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.GroupRows, nil
}

func filterTags(ids []id.TagID, rows []*tag.Tag) []*tag.Tag {
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

func filterTagItems(ids []id.TagID, rows []*tag.Item) []*tag.Item {
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

func filterTagGroups(ids []id.TagID, rows []*tag.Group) []*tag.Group {
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

func (*tagRepo) sceneFilter(filter bson.D, scenes []id.SceneID) bson.D {
	if scenes == nil {
		return filter
	}
	filter = append(filter, bson.E{
		Key:   "scene",
		Value: bson.D{{Key: "$in", Value: id.SceneIDsToStrings(scenes)}},
	})
	return filter
}
