package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/scene"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type sceneLockRepo struct {
	client *mongodoc.ClientCollection
}

func NewSceneLock(client *mongodoc.Client) repo.SceneLock {
	return &sceneLockRepo{client: client.WithCollection("sceneLock")}
}

func (r *sceneLockRepo) GetLock(ctx context.Context, sceneID id.SceneID) (scene.LockMode, error) {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	var c mongodoc.SceneLockConsumer
	if err2 := r.client.FindOne(ctx, filter, &c); err2 != nil {
		if errors.Is(err2, rerror.ErrNotFound) {
			return scene.LockModeFree, nil
		}
		return scene.LockMode(""), err2
	}
	return c.Rows[0], nil
}

func (r *sceneLockRepo) GetAllLock(ctx context.Context, ids id.SceneIDList) ([]scene.LockMode, error) {
	filter := bson.D{
		{Key: "scene", Value: bson.D{
			{Key: "$in", Value: ids.Strings()},
		}},
	}
	c := mongodoc.SceneLockConsumer{
		Rows: make([]scene.LockMode, 0, len(ids)),
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *sceneLockRepo) SaveLock(ctx context.Context, sceneID id.SceneID, lock scene.LockMode) error {
	filter := bson.D{{Key: "scene", Value: sceneID.String()}}
	doc := mongodoc.NewSceneLock(sceneID, lock)
	upsert := true
	if _, err2 := r.client.Collection().UpdateOne(ctx, filter, bson.D{
		{Key: "$set", Value: doc},
	}, &options.UpdateOptions{
		Upsert: &upsert,
	}); err2 != nil {
		return rerror.ErrInternalBy(err2)
	}
	return nil
}

func (r *sceneLockRepo) ReleaseAllLock(ctx context.Context) error {
	if _, err2 := r.client.Collection().DeleteMany(ctx, bson.D{}); err2 != nil {
		if err2 != mongo.ErrNilDocument && err2 != mongo.ErrNoDocuments {
			return rerror.ErrInternalBy(err2)
		}
	}
	return nil
}
