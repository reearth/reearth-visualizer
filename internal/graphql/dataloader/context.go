package dataloader

//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen -template=loader.tmpl -output=loader_gen.go -m=Dataset -m=Layer -m=Plugin -m=Project -m=Property -m=Scene -m=Team -m=User
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen -template=loader.tmpl -output=loader_layer_item_gen.go -controller=Layer -method=FetchItem -id=LayerID -m=LayerItem
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen -template=loader.tmpl -output=loader_layer_group_gen.go -controller=Layer -method=FetchGroup -id=LayerID -m=LayerGroup
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen -template=loader.tmpl -output=loader_dataset_schema_gen.go -controller=Dataset -method=FetchSchema -m=DatasetSchema
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen -template=loader.tmpl -output=loader_property_schema_gen.go -controller=Property -method=FetchSchema -m=PropertySchema

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/usecase"
)

type dataLoadersKey struct{}

type DataLoaders struct {
	Dataset        DatasetDataLoader
	DatasetSchema  DatasetSchemaDataLoader
	LayerItem      LayerItemDataLoader
	LayerGroup     LayerGroupDataLoader
	Layer          LayerDataLoader
	Plugin         PluginDataLoader
	Project        ProjectDataLoader
	Property       PropertyDataLoader
	PropertySchema PropertySchemaDataLoader
	Scene          SceneDataLoader
	Team           TeamDataLoader
	User           UserDataLoader
}

func DataLoadersFromContext(ctx context.Context) *DataLoaders {
	return ctx.Value(dataLoadersKey{}).(*DataLoaders)
}

func DataLoadersKey() interface{} {
	return dataLoadersKey{}
}

func NewDataLoaders(ctx context.Context, c *graphql.Container, o *usecase.Operator) *DataLoaders {
	return &DataLoaders{
		Dataset:        newDataset(ctx, c.DatasetController, o),
		DatasetSchema:  newDatasetSchema(ctx, c.DatasetController, o),
		LayerItem:      newLayerItem(ctx, c.LayerController, o),
		LayerGroup:     newLayerGroup(ctx, c.LayerController, o),
		Layer:          newLayer(ctx, c.LayerController, o),
		Plugin:         newPlugin(ctx, c.PluginController, o),
		Project:        newProject(ctx, c.ProjectController, o),
		Property:       newProperty(ctx, c.PropertyController, o),
		PropertySchema: newPropertySchema(ctx, c.PropertyController, o),
		Scene:          newScene(ctx, c.SceneController, o),
		Team:           newTeam(ctx, c.TeamController, o),
		User:           newUser(ctx, c.UserController, o),
	}
}

func NewOrdinaryDataLoaders(ctx context.Context, c *graphql.Container, o *usecase.Operator) *DataLoaders {
	return &DataLoaders{
		Dataset:        newOrdinaryDataset(ctx, c.DatasetController, o),
		DatasetSchema:  newOrdinaryDatasetSchema(ctx, c.DatasetController, o),
		LayerItem:      newOrdinaryLayerItem(ctx, c.LayerController, o),
		LayerGroup:     newOrdinaryLayerGroup(ctx, c.LayerController, o),
		Layer:          newOrdinaryLayer(ctx, c.LayerController, o),
		Plugin:         newOrdinaryPlugin(ctx, c.PluginController, o),
		Project:        newOrdinaryProject(ctx, c.ProjectController, o),
		Property:       newOrdinaryProperty(ctx, c.PropertyController, o),
		PropertySchema: newOrdinaryPropertySchema(ctx, c.PropertyController, o),
		Scene:          newOrdinaryScene(ctx, c.SceneController, o),
		Team:           newOrdinaryTeam(ctx, c.TeamController, o),
		User:           newOrdinaryUser(ctx, c.UserController, o),
	}
}
