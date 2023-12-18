package mongo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/storytelling"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
)

var (
	storytellingIndexes       = []string{"alias", "alias,status", "scene"}
	storytellingUniqueIndexes = []string{"id"}
)

type Storytelling struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewStorytelling(client *mongox.Client) *Storytelling {
	return &Storytelling{
		client: client.WithCollection("storytelling"),
	}
}

func (r *Storytelling) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, storytellingIndexes, storytellingUniqueIndexes)
}

func (r *Storytelling) Filtered(f repo.SceneFilter) repo.Storytelling {
	return &Storytelling{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Storytelling) FindByID(ctx context.Context, id id.StoryID) (*storytelling.Story, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	}, true)
}

func (r *Storytelling) FindByIDs(ctx context.Context, ids id.StoryIDList) (*storytelling.StoryList, error) {
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
	return filterStories(ids, *res), nil
}

func (r *Storytelling) FindByScene(ctx context.Context, id id.SceneID) (*storytelling.StoryList, error) {
	if !r.f.CanRead(id) {
		return nil, nil
	}
	return r.find(ctx, bson.M{
		"scene": id.String(),
	})
}

func (r *Storytelling) FindByPublicName(ctx context.Context, name string) (*storytelling.Story, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}

	f := bson.D{
		{Key: "alias", Value: name},
		{Key: "status", Value: bson.D{{Key: "$in", Value: []string{"public", "limited"}}}},
	}

	return r.findOne(ctx, f, false)
}

func (r *Storytelling) Save(ctx context.Context, story storytelling.Story) error {
	if !r.f.CanWrite(story.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, sId := mongodoc.NewStorytelling(&story)
	return r.client.SaveOne(ctx, sId, doc)
}

func (r *Storytelling) SaveAll(ctx context.Context, stories storytelling.StoryList) error {
	for _, s := range stories {
		if !r.f.CanWrite(s.Scene()) {
			return repo.ErrOperationDenied
		}
	}

	doc, sId := mongodoc.NewStorytellings(&stories)
	return r.client.SaveAll(ctx, sId, doc)
}

func (r *Storytelling) Remove(ctx context.Context, id id.StoryID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Storytelling) RemoveAll(ctx context.Context, ids id.StoryIDList) error {
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *Storytelling) RemoveByScene(ctx context.Context, id id.SceneID) error {
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{"scene": id.String()}))
}

func (r *Storytelling) find(ctx context.Context, filter interface{}) (*storytelling.StoryList, error) {
	c := mongodoc.NewStorytellingConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return (*storytelling.StoryList)(&c.Result), nil
}

func (r *Storytelling) findOne(ctx context.Context, filter any, filterByScene bool) (*storytelling.Story, error) {
	var f []id.SceneID
	if filterByScene {
		f = r.f.Readable
	}
	c := mongodoc.NewStorytellingConsumer(f)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func filterStories(ids id.StoryIDList, rows storytelling.StoryList) *storytelling.StoryList {
	res := make(storytelling.StoryList, 0, len(ids))
	for _, sId := range ids {
		var s *storytelling.Story
		for _, r := range rows {
			if r.Id() == sId {
				s = r
				break
			}
		}
		res = append(res, s)
	}
	return &res
}

func (r *Storytelling) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
