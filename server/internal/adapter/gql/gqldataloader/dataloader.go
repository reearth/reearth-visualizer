package gqldataloader

//go:generate go run github.com/vektah/dataloaden AssetLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Asset
//go:generate go run github.com/vektah/dataloaden DatasetLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Dataset
//go:generate go run github.com/vektah/dataloaden DatasetSchemaLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.DatasetSchema
//go:generate go run github.com/vektah/dataloaden LayerLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Layer
//go:generate go run github.com/vektah/dataloaden LayerGroupLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.LayerGroup
//go:generate go run github.com/vektah/dataloaden LayerItemLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.LayerItem
//go:generate go run github.com/vektah/dataloaden PluginLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Plugin
//go:generate go run github.com/vektah/dataloaden ProjectLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Project
//go:generate go run github.com/vektah/dataloaden PropertyLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Property
//go:generate go run github.com/vektah/dataloaden PropertySchemaLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.PropertySchema
//go:generate go run github.com/vektah/dataloaden SceneLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Scene
//go:generate go run github.com/vektah/dataloaden WorkspaceLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Team
//go:generate go run github.com/vektah/dataloaden UserLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.User
//go:generate go run github.com/vektah/dataloaden TagLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Tag
//go:generate go run github.com/vektah/dataloaden TagItemLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.TagItem
//go:generate go run github.com/vektah/dataloaden TagGroupLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.TagGroup
//go:generate go run github.com/vektah/dataloaden PolicyLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Policy
