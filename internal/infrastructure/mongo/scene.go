package mongo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/user"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type sceneRepo struct {
	client *mongodoc.ClientCollection
	f      repo.TeamFilter
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

func (r *sceneRepo) Filtered(f repo.TeamFilter) repo.Scene {
	return &sceneRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *sceneRepo) FindByID(ctx context.Context, id id.SceneID) (*scene.Scene, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *sceneRepo) FindByIDs(ctx context.Context, ids []id.SceneID) (scene.List, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": id.SceneIDsToStrings(ids),
		},
	}
	dst := make(scene.List, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterScenes(ids, res), nil
}

func (r *sceneRepo) FindByProject(ctx context.Context, id id.ProjectID) (*scene.Scene, error) {
	filter := bson.M{
		"project": id.String(),
	}
	return r.findOne(ctx, filter)
}

func (r *sceneRepo) FindByTeam(ctx context.Context, teams ...id.TeamID) (scene.List, error) {
	if r.f.Readable != nil {
		teams = user.TeamIDList(teams).Filter(r.f.Readable...)
	}
	res, err := r.find(ctx, nil, bson.M{
		"team": bson.M{"$in": user.TeamIDList(teams).Strings()},
	})
	if err != nil && err != mongo.ErrNilDocument && err != mongo.ErrNoDocuments {
		return nil, err
	}
	return res, nil
}

func (r *sceneRepo) Save(ctx context.Context, scene *scene.Scene) error {
	if !r.f.CanWrite(scene.Team()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewScene(scene)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *sceneRepo) Remove(ctx context.Context, id id.SceneID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *sceneRepo) find(ctx context.Context, dst []*scene.Scene, filter interface{}) ([]*scene.Scene, error) {
	c := mongodoc.SceneConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *sceneRepo) findOne(ctx context.Context, filter interface{}) (*scene.Scene, error) {
	dst := make([]*scene.Scene, 0, 1)
	c := mongodoc.SceneConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func filterScenes(ids []id.SceneID, rows scene.List) scene.List {
	return rows.FilterByID(ids...)
}

func (r *sceneRepo) readFilter(filter interface{}) interface{} {
	return applyTeamFilter(filter, r.f.Readable)
}

func (r *sceneRepo) writeFilter(filter interface{}) interface{} {
	return applyTeamFilter(filter, r.f.Writable)
}
