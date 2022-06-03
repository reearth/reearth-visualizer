package memory

import (
	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

func New() *repo.Container {
	c := &repo.Container{}
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
	c.Tag = NewTag()
	c.Team = NewTeam()
	c.User = NewUser()
	c.SceneLock = NewSceneLock()
	c.Transaction = NewTransaction()
	c.Lock = NewLock()
	return c
}
