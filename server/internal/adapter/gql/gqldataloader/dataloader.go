package gqldataloader

//go:generate go run github.com/vektah/dataloaden AssetLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Asset
//go:generate go run github.com/vektah/dataloaden PluginLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Plugin
//go:generate go run github.com/vektah/dataloaden ProjectLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Project
//go:generate go run github.com/vektah/dataloaden ProjectMetadataLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ProjectMetadata
//go:generate go run github.com/vektah/dataloaden PropertyLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Property
//go:generate go run github.com/vektah/dataloaden PropertySchemaLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.PropertySchema
//go:generate go run github.com/vektah/dataloaden SceneLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Scene
//go:generate go run github.com/vektah/dataloaden StoryLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Story
//go:generate go run github.com/vektah/dataloaden WorkspaceLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Workspace
//go:generate go run github.com/vektah/dataloaden UserLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.User
//go:generate go run github.com/vektah/dataloaden PolicyLoader github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.ID *github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel.Policy
