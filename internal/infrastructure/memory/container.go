package memory

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

// InitRepos _
func InitRepos(c *repo.Container, dummy bool) *repo.Container {
	if c == nil {
		c = &repo.Container{}
	}
	// not supported: File, PluginRepository
	c.Asset = NewAsset()
	c.Config = NewConfig()
	c.DatasetSchema = NewDatasetSchema()
	c.Dataset = NewDataset()
	c.Layer = NewLayer()
	c.Plugin = NewPlugin()
	c.Project = NewProject()
	c.PropertySchema = NewPropertySchema()
	c.Property = NewProperty()
	c.Scene = NewScene()
	c.Team = NewTeam()
	c.User = NewUser()
	c.SceneLock = NewSceneLock()
	c.Transaction = NewTransaction()

	if dummy {
		generateDummyData(context.Background(), c)
	}

	return c
}
