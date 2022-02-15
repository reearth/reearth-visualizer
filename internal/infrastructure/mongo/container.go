package mongo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/migration"
	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
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
	c.Team = NewTeam(client)
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
