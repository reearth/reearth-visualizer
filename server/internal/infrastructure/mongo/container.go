package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/migration"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearthx/authserver"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func New(ctx context.Context, db *mongo.Database) (*repo.Container, error) {
	lock, err := NewLock(db.Collection("locks"))
	if err != nil {
		return nil, err
	}

	client := mongox.NewClientWithDatabase(db)
	c := &repo.Container{
		Asset:          NewAsset(client),
		AuthRequest:    authserver.NewMongo(client.WithCollection("authRequest")),
		Config:         NewConfig(db.Collection("config"), lock),
		DatasetSchema:  NewDatasetSchema(client),
		Dataset:        NewDataset(client),
		Layer:          NewLayer(client),
		Plugin:         NewPlugin(client),
		Project:        NewProject(client),
		PropertySchema: NewPropertySchema(client),
		Property:       NewProperty(client),
		Scene:          NewScene(client),
		Tag:            NewTag(client),
		Workspace:      NewWorkspace(client),
		User:           NewUser(client),
		SceneLock:      NewSceneLock(client),
		Transaction:    mongox.NewTransaction(client),
		Policy:         NewPolicy(client),
		Lock:           lock,
	}

	// init
	if err := Init(c); err != nil {
		return nil, err
	}

	// migration
	m := migration.Client{Client: client, Config: c.Config}
	if err := m.Migrate(ctx); err != nil {
		return nil, err
	}

	return c, nil
}

func Init(r *repo.Container) error {
	if r == nil {
		return nil
	}

	return util.Try(
		r.Asset.(*Asset).Init,
		r.AuthRequest.(*authserver.Mongo).Init,
		r.Dataset.(*Dataset).Init,
		r.DatasetSchema.(*DatasetSchema).Init,
		r.Layer.(*Layer).Init,
		r.Plugin.(*Plugin).Init,
		r.Policy.(*Policy).Init,
		r.Project.(*Project).Init,
		r.Property.(*Property).Init,
		r.PropertySchema.(*PropertySchema).Init,
		r.Scene.(*Scene).Init,
		r.Tag.(*Tag).Init,
		r.User.(*User).Init,
		r.Workspace.(*Workspace).Init,
	)
}

func applyWorkspaceFilter(filter interface{}, ids user.WorkspaceIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "team", bson.M{"$in": ids.Strings()})
}

func applySceneFilter(filter interface{}, ids scene.IDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "scene", bson.M{"$in": ids.Strings()})
}

func applyOptionalSceneFilter(filter interface{}, ids scene.IDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "", bson.M{"$or": []bson.M{
		{"scene": bson.M{"$in": ids.Strings()}},
		{"scene": nil},
		{"scene": ""},
	}})
}

func createIndexes(ctx context.Context, c *mongox.ClientCollection, keys, uniqueKeys []string) error {
	created, deleted, err := c.Indexes(ctx, keys, uniqueKeys)
	if len(created) > 0 || len(deleted) > 0 {
		log.Infof("mongo: %s: index deleted: %v, created: %v\n", c.Client().Name(), deleted, created)
	}
	return err
}
