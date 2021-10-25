package gqldataloader

//go:generate go run github.com/vektah/dataloaden AssetLoader github.com/reearth/reearth-backend/pkg/id.AssetID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Asset
//go:generate go run github.com/vektah/dataloaden DatasetLoader github.com/reearth/reearth-backend/pkg/id.DatasetID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Dataset
//go:generate go run github.com/vektah/dataloaden DatasetSchemaLoader github.com/reearth/reearth-backend/pkg/id.DatasetSchemaID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.DatasetSchema
//go:generate go run github.com/vektah/dataloaden LayerLoader github.com/reearth/reearth-backend/pkg/id.LayerID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Layer
//go:generate go run github.com/vektah/dataloaden LayerGroupLoader github.com/reearth/reearth-backend/pkg/id.LayerID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.LayerGroup
//go:generate go run github.com/vektah/dataloaden LayerItemLoader github.com/reearth/reearth-backend/pkg/id.LayerID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.LayerItem
//go:generate go run github.com/vektah/dataloaden PluginLoader github.com/reearth/reearth-backend/pkg/id.PluginID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Plugin
//go:generate go run github.com/vektah/dataloaden ProjectLoader github.com/reearth/reearth-backend/pkg/id.ProjectID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Project
//go:generate go run github.com/vektah/dataloaden PropertyLoader github.com/reearth/reearth-backend/pkg/id.PropertyID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Property
//go:generate go run github.com/vektah/dataloaden PropertySchemaLoader github.com/reearth/reearth-backend/pkg/id.PropertySchemaID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.PropertySchema
//go:generate go run github.com/vektah/dataloaden SceneLoader github.com/reearth/reearth-backend/pkg/id.SceneID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Scene
//go:generate go run github.com/vektah/dataloaden TeamLoader github.com/reearth/reearth-backend/pkg/id.TeamID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Team
//go:generate go run github.com/vektah/dataloaden UserLoader github.com/reearth/reearth-backend/pkg/id.UserID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.User
//go:generate go run github.com/vektah/dataloaden TagLoader github.com/reearth/reearth-backend/pkg/id.TagID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.Tag
//go:generate go run github.com/vektah/dataloaden TagItemLoader github.com/reearth/reearth-backend/pkg/id.TagID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.TagItem
//go:generate go run github.com/vektah/dataloaden TagGroupLoader github.com/reearth/reearth-backend/pkg/id.TagID *github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel.TagGroup
