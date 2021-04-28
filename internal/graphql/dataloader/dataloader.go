package dataloader

//go:generate go run github.com/vektah/dataloaden DatasetLoader github.com/reearth/reearth-backend/pkg/id.DatasetID *github.com/reearth/reearth-backend/internal/adapter/graphql.Dataset
//go:generate go run github.com/vektah/dataloaden DatasetSchemaLoader github.com/reearth/reearth-backend/pkg/id.DatasetSchemaID *github.com/reearth/reearth-backend/internal/adapter/graphql.DatasetSchema
//go:generate go run github.com/vektah/dataloaden LayerLoader github.com/reearth/reearth-backend/pkg/id.LayerID *github.com/reearth/reearth-backend/internal/adapter/graphql.Layer
//go:generate go run github.com/vektah/dataloaden LayerGroupLoader github.com/reearth/reearth-backend/pkg/id.LayerID *github.com/reearth/reearth-backend/internal/adapter/graphql.LayerGroup
//go:generate go run github.com/vektah/dataloaden LayerItemLoader github.com/reearth/reearth-backend/pkg/id.LayerID *github.com/reearth/reearth-backend/internal/adapter/graphql.LayerItem
//go:generate go run github.com/vektah/dataloaden PluginLoader github.com/reearth/reearth-backend/pkg/id.PluginID *github.com/reearth/reearth-backend/internal/adapter/graphql.Plugin
//go:generate go run github.com/vektah/dataloaden ProjectLoader github.com/reearth/reearth-backend/pkg/id.ProjectID *github.com/reearth/reearth-backend/internal/adapter/graphql.Project
//go:generate go run github.com/vektah/dataloaden PropertyLoader github.com/reearth/reearth-backend/pkg/id.PropertyID *github.com/reearth/reearth-backend/internal/adapter/graphql.Property
//go:generate go run github.com/vektah/dataloaden PropertySchemaLoader github.com/reearth/reearth-backend/pkg/id.PropertySchemaID *github.com/reearth/reearth-backend/internal/adapter/graphql.PropertySchema
//go:generate go run github.com/vektah/dataloaden SceneLoader github.com/reearth/reearth-backend/pkg/id.SceneID *github.com/reearth/reearth-backend/internal/adapter/graphql.Scene
//go:generate go run github.com/vektah/dataloaden TeamLoader github.com/reearth/reearth-backend/pkg/id.TeamID *github.com/reearth/reearth-backend/internal/adapter/graphql.Team
//go:generate go run github.com/vektah/dataloaden UserLoader github.com/reearth/reearth-backend/pkg/id.UserID *github.com/reearth/reearth-backend/internal/adapter/graphql.User
