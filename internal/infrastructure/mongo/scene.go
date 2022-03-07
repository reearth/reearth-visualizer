package mongo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/scene"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type sceneRepo struct {
	client *mongodoc.ClientCollection
}

func NewScene(client *mongodoc.Client) repo.Scene {
	r := &sceneRepo{client: client.WithCollection("scene")}
	r.init()
	return r
}

func (r *sceneRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"project"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "scene", i)
	}
}

func (r *sceneRepo) FindByID(ctx context.Context, id id.SceneID, f []id.TeamID) (*scene.Scene, error) {
	filter := r.teamFilter(bson.M{
		"id": id.String(),
	}, f)
	return r.findOne(ctx, filter)
}

func (r *sceneRepo) FindByIDs(ctx context.Context, ids []id.SceneID, f []id.TeamID) (scene.List, error) {
	filter := r.teamFilter(bson.M{
		"id": bson.M{
			"$in": id.SceneIDsToStrings(ids),
		},
	}, f)
	dst := make(scene.List, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterScenes(ids, res), nil
}

func (r *sceneRepo) FindByProject(ctx context.Context, id id.ProjectID, f []id.TeamID) (*scene.Scene, error) {
	filter := r.teamFilter(bson.M{
		"project": id.String(),
	}, f)
	return r.findOne(ctx, filter)
}

func (r *sceneRepo) FindByTeam(ctx context.Context, teams ...id.TeamID) (scene.List, error) {
	res, err := r.find(ctx, nil, bson.M{
		"team": bson.M{"$in": id.TeamIDsToStrings(teams)},
	})
	if err != nil {
		if err != mongo.ErrNilDocument && err != mongo.ErrNoDocuments {
			return nil, err
		}
	}
	return res, nil
}

func (r *sceneRepo) Save(ctx context.Context, scene *scene.Scene) error {
	doc, id := mongodoc.NewScene(scene)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *sceneRepo) Remove(ctx context.Context, id id.SceneID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *sceneRepo) find(ctx context.Context, dst []*scene.Scene, filter interface{}) ([]*scene.Scene, error) {
	c := mongodoc.SceneConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *sceneRepo) findOne(ctx context.Context, filter interface{}) (*scene.Scene, error) {
	dst := make([]*scene.Scene, 0, 1)
	c := mongodoc.SceneConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func filterScenes(ids []id.SceneID, rows scene.List) scene.List {
	return rows.FilterByID(ids...)
}

func (*sceneRepo) teamFilter(filter bson.M, teams []id.TeamID) bson.M {
	if teams == nil {
		return filter
	}
	filter["team"] = bson.D{{Key: "$in", Value: id.TeamIDsToStrings(teams)}}
	return filter
}
