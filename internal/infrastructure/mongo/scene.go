package mongo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/scene"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	i := r.client.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "scene", i)
	}
}

func (r *sceneRepo) FindByID(ctx context.Context, id id.SceneID, f []id.TeamID) (*scene.Scene, error) {
	filter := r.teamFilter(bson.D{
		{Key: "id", Value: id.String()},
	}, f)
	return r.findOne(ctx, filter)
}

func (r *sceneRepo) FindByIDs(ctx context.Context, ids []id.SceneID, f []id.TeamID) ([]*scene.Scene, error) {
	filter := r.teamFilter(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.SceneIDToKeys(ids)},
		}},
	}, f)
	dst := make([]*scene.Scene, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterScenes(ids, res), nil
}

func (r *sceneRepo) FindByProject(ctx context.Context, id id.ProjectID, f []id.TeamID) (*scene.Scene, error) {
	filter := r.teamFilter(bson.D{
		{Key: "project", Value: id.String()},
	}, f)
	return r.findOne(ctx, filter)
}

func (r *sceneRepo) FindIDsByTeam(ctx context.Context, teams []id.TeamID) ([]id.SceneID, error) {
	filter := bson.D{
		{Key: "team", Value: bson.D{
			{Key: "$in", Value: id.TeamIDToKeys(teams)},
		}},
	}
	c := mongodoc.SceneIDConsumer{
		Rows: []id.SceneID{},
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		if err != mongo.ErrNilDocument && err != mongo.ErrNoDocuments {
			return nil, err
		}
	}
	return c.Rows, nil
}

func (r *sceneRepo) HasSceneTeam(ctx context.Context, sceneID id.SceneID, temaIDs []id.TeamID) (bool, error) {
	filter := bson.D{
		{Key: "id", Value: sceneID.String()},
		{Key: "team", Value: bson.D{{Key: "$in", Value: id.TeamIDToKeys(temaIDs)}}},
	}
	res, err2 := r.client.Collection().CountDocuments(ctx, filter)
	if err2 != nil {
		return false, err1.ErrInternalBy(err2)
	}
	return res == 1, nil
}

func (r *sceneRepo) HasScenesTeam(ctx context.Context, sceneIDs []id.SceneID, teamIDs []id.TeamID) ([]bool, error) {
	cursor, err2 := r.client.Collection().Find(ctx, bson.D{
		{Key: "id", Value: bson.D{{Key: "$in", Value: id.SceneIDToKeys(sceneIDs)}}},
		{Key: "team", Value: bson.D{{Key: "$in", Value: id.TeamIDToKeys(teamIDs)}}},
	}, &options.FindOptions{
		Projection: bson.D{{Key: "id", Value: 1}, {Key: "_id", Value: 0}},
	})

	if err2 != nil {
		return nil, err1.ErrInternalBy(err2)
	}

	var res []struct{ ID string }
	err2 = cursor.All(ctx, res)
	if err2 != nil {
		return nil, err1.ErrInternalBy(err2)
	}

	res2 := make([]bool, 0, len(sceneIDs))
	for _, sid := range sceneIDs {
		ok := false
		for _, r := range res {
			if r.ID == sid.String() {
				ok = true
				break
			}
		}
		res2 = append(res2, ok)
	}

	return res2, nil
}

func (r *sceneRepo) Save(ctx context.Context, scene *scene.Scene) error {
	doc, id := mongodoc.NewScene(scene)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *sceneRepo) Remove(ctx context.Context, id id.SceneID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *sceneRepo) find(ctx context.Context, dst []*scene.Scene, filter bson.D) ([]*scene.Scene, error) {
	c := mongodoc.SceneConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *sceneRepo) findOne(ctx context.Context, filter bson.D) (*scene.Scene, error) {
	dst := make([]*scene.Scene, 0, 1)
	c := mongodoc.SceneConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

// func (r *sceneRepo) paginate(ctx context.Context, filter bson.D, pagination *usecase.Pagination) ([]*scene.Scene, *usecase.PageInfo, error) {
// 	var c mongodoc.SceneConsumer
// 	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
// 	if err2 != nil {
// 		return nil, nil, err1.ErrInternalBy(err2)
// 	}
// 	return c.Rows, pageInfo, nil
// }

func filterScenes(ids []id.SceneID, rows []*scene.Scene) []*scene.Scene {
	res := make([]*scene.Scene, 0, len(ids))
	for _, id := range ids {
		var r2 *scene.Scene
		for _, r := range rows {
			if r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func (*sceneRepo) teamFilter(filter bson.D, teams []id.TeamID) bson.D {
	if teams == nil {
		return filter
	}
	filter = append(filter, bson.E{
		Key:   "team",
		Value: bson.D{{Key: "$in", Value: id.TeamIDToKeys(teams)}},
	})
	return filter
}
