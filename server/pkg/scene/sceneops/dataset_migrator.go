package sceneops

import (
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
)

// TODO: define new loader types and use them instead of repos
type DatasetMigrator struct {
	PropertyRepo repo.Property
	Plugin       plugin.Loader
}

type MigrateDatasetResult struct {
	Properties property.Map
}

func (r MigrateDatasetResult) Merge(r2 MigrateDatasetResult) MigrateDatasetResult {
	return MigrateDatasetResult{
		Properties: r.Properties.Merge(r2.Properties),
	}
}
