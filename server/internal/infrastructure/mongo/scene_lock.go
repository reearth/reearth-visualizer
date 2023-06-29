package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SceneLock struct {
	client *mongox.ClientCollection
}

func NewSceneLock(client *mongox.Client) *SceneLock {
	return &SceneLock{client: client.WithCollection("sceneLock")}
}

func (r *SceneLock) GetLock(ctx context.Context, sceneID id.SceneID) (scene.LockMode, error) {
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

func (r *SceneLock) GetAllLock(ctx context.Context, ids id.SceneIDList) ([]scene.LockMode, error) {
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

func (r *SceneLock) SaveLock(ctx context.Context, sceneID id.SceneID, lock scene.LockMode) error {
	filter := bson.D{{Key: "scene", Value: sceneID.String()}}
	doc := mongodoc.NewSceneLock(sceneID, lock)
	upsert := true
	if _, err2 := r.client.Client().UpdateOne(ctx, filter, bson.D{
		{Key: "$set", Value: doc},
	}, &options.UpdateOptions{
		Upsert: &upsert,
	}); err2 != nil {
		return rerror.ErrInternalByWithContext(ctx, err2)
	}
	return nil
}

func (r *SceneLock) ReleaseAllLock(ctx context.Context) error {
	if _, err2 := r.client.Client().DeleteMany(ctx, bson.D{}); err2 != nil {
		if err2 != mongo.ErrNilDocument && err2 != mongo.ErrNoDocuments {
			return rerror.ErrInternalByWithContext(ctx, err2)
		}
	}
	return nil
}
