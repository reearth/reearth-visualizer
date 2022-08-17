package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/migration"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/user"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func InitRepos(ctx context.Context, c *repo.Container, mc *mongo.Client, databaseName string) error {
	if databaseName == "" {
		databaseName = "reearth"
	}

	lock, err := NewLock(mc.Database(databaseName).Collection("locks"))
	if err != nil {
		return err
	}

	client := mongodoc.NewClient(databaseName, mc)
	c.Asset = NewAsset(client)
	c.AuthRequest = NewAuthRequest(client)
	c.Config = NewConfig(client, lock)
	c.DatasetSchema = NewDatasetSchema(client)
	c.Dataset = NewDataset(client)
	c.Layer = NewLayer(client)
	c.Plugin = NewPlugin(client)
	c.Project = NewProject(client)
	c.PropertySchema = NewPropertySchema(client)
	c.Property = NewProperty(client)
	c.Scene = NewScene(client)
	c.Tag = NewTag(client)
	c.Workspace = NewWorkspace(client)
	c.User = NewUser(client)
	c.SceneLock = NewSceneLock(client)
	c.Transaction = NewTransaction(client)
	c.Lock = lock

	// migration
	m := migration.Client{Client: client, Config: c.Config}
	if err := m.Migrate(ctx); err != nil {
		return err
	}

	return nil
}

func applyWorkspaceFilter(filter interface{}, ids user.WorkspaceIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongodoc.And(filter, "team", bson.M{"$in": ids.Strings()})
}

func applySceneFilter(filter interface{}, ids scene.IDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongodoc.And(filter, "scene", bson.M{"$in": ids.Strings()})
}

func applyOptionalSceneFilter(filter interface{}, ids scene.IDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongodoc.And(filter, "", bson.M{"$or": []bson.M{
		{"scene": bson.M{"$in": ids.Strings()}},
		{"scene": nil},
		{"scene": ""},
	}})
}
