package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Query() QueryResolver {
	return &queryResolver{r}
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) Assets(ctx context.Context, teamID id.ID, keyword *string, sortType *gqlmodel.AssetSortType, pagination *gqlmodel.Pagination) (*gqlmodel.AssetConnection, error) {
	return loaders(ctx).Asset.FindByTeam(ctx, teamID, keyword, gqlmodel.AssetSortTypeFrom(sortType), pagination)
}

func (r *queryResolver) Me(ctx context.Context) (*gqlmodel.User, error) {
	u := getUser(ctx)
	if u == nil {
		return nil, nil
	}
	return gqlmodel.ToUser(u), nil
}

func (r *queryResolver) Node(ctx context.Context, i id.ID, typeArg gqlmodel.NodeType) (gqlmodel.Node, error) {
	dataloaders := dataloaders(ctx)
	switch typeArg {
	case gqlmodel.NodeTypeAsset:
		result, err := dataloaders.Asset.Load(id.AssetID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeDataset:
		result, err := dataloaders.Dataset.Load(id.DatasetID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeDatasetSchema:
		result, err := dataloaders.DatasetSchema.Load(id.DatasetSchemaID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeLayerItem:
		result, err := dataloaders.LayerItem.Load(id.LayerID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeLayerGroup:
		result, err := dataloaders.LayerGroup.Load(id.LayerID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeProject:
		result, err := dataloaders.Project.Load(id.ProjectID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeProperty:
		result, err := dataloaders.Property.Load(id.PropertyID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeScene:
		result, err := dataloaders.Scene.Load(id.SceneID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeTeam:
		result, err := dataloaders.Team.Load(id.TeamID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeUser:
		result, err := dataloaders.User.Load(id.UserID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	}
	return nil, nil
}

func (r *queryResolver) Nodes(ctx context.Context, ids []*id.ID, typeArg gqlmodel.NodeType) ([]gqlmodel.Node, error) {
	dataloaders := dataloaders(ctx)
	switch typeArg {
	case gqlmodel.NodeTypeAsset:
		data, err := dataloaders.Asset.LoadAll(id.AssetIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeDataset:
		data, err := dataloaders.Dataset.LoadAll(id.DatasetIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeDatasetSchema:
		data, err := dataloaders.DatasetSchema.LoadAll(id.DatasetSchemaIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeLayerItem:
		data, err := dataloaders.LayerItem.LoadAll(id.LayerIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = *data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeLayerGroup:
		data, err := dataloaders.LayerGroup.LoadAll(id.LayerIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = *data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeProject:
		data, err := dataloaders.Project.LoadAll(id.ProjectIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeProperty:
		data, err := dataloaders.Property.LoadAll(id.PropertyIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeScene:
		data, err := dataloaders.Scene.LoadAll(id.SceneIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeTeam:
		data, err := dataloaders.Team.LoadAll(id.TeamIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeUser:
		data, err := dataloaders.User.LoadAll(id.UserIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	default:
		return nil, nil
	}
}

func (r *queryResolver) PropertySchema(ctx context.Context, i id.PropertySchemaID) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(i)
}

func (r *queryResolver) PropertySchemas(ctx context.Context, ids []*id.PropertySchemaID) ([]*gqlmodel.PropertySchema, error) {
	ids2 := make([]id.PropertySchemaID, 0, len(ids))
	for _, i := range ids {
		if i != nil {
			ids2 = append(ids2, *i)
		}
	}

	data, err := dataloaders(ctx).PropertySchema.LoadAll(ids2)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}

	return data, nil
}

func (r *queryResolver) Plugin(ctx context.Context, id id.PluginID) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(id)
}

func (r *queryResolver) Plugins(ctx context.Context, ids []*id.PluginID) ([]*gqlmodel.Plugin, error) {
	ids2 := make([]id.PluginID, 0, len(ids))
	for _, i := range ids {
		if i != nil {
			ids2 = append(ids2, *i)
		}
	}

	data, err := dataloaders(ctx).Plugin.LoadAll(ids2)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}

	return data, nil
}

func (r *queryResolver) Layer(ctx context.Context, layerID id.ID) (gqlmodel.Layer, error) {
	dataloaders := dataloaders(ctx)
	result, err := dataloaders.Layer.Load(id.LayerID(layerID))
	if result == nil || *result == nil {
		return nil, nil
	}
	return *result, err
}

func (r *queryResolver) Scene(ctx context.Context, projectID id.ID) (*gqlmodel.Scene, error) {
	return loaders(ctx).Scene.FindByProject(ctx, id.ProjectID(projectID))
}

func (r *queryResolver) Projects(ctx context.Context, teamID id.ID, includeArchived *bool, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindByTeam(ctx, id.TeamID(teamID), first, last, before, after)
}

func (r *queryResolver) DatasetSchemas(ctx context.Context, sceneID id.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.DatasetSchemaConnection, error) {
	return loaders(ctx).Dataset.FindSchemaByScene(ctx, sceneID, first, last, before, after)
}

func (r *queryResolver) DynamicDatasetSchemas(ctx context.Context, sceneID id.ID) ([]*gqlmodel.DatasetSchema, error) {
	return loaders(ctx).Dataset.FindDynamicSchemasByScene(ctx, sceneID)
}

func (r *queryResolver) Datasets(ctx context.Context, datasetSchemaID id.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.DatasetConnection, error) {
	return loaders(ctx).Dataset.FindBySchema(ctx, datasetSchemaID, first, last, before, after)
}

func (r *queryResolver) SceneLock(ctx context.Context, sceneID id.ID) (*gqlmodel.SceneLockMode, error) {
	return loaders(ctx).Scene.FetchLock(ctx, id.SceneID(sceneID))
}

func (r *queryResolver) SearchUser(ctx context.Context, nameOrEmail string) (*gqlmodel.SearchedUser, error) {
	return loaders(ctx).User.SearchUser(ctx, nameOrEmail)
}

func (r *queryResolver) CheckProjectAlias(ctx context.Context, alias string) (*gqlmodel.ProjectAliasAvailability, error) {
	return loaders(ctx).Project.CheckAlias(ctx, alias)
}

func (r *queryResolver) InstallablePlugins(ctx context.Context) ([]*gqlmodel.PluginMetadata, error) {
	return loaders(ctx).Plugin.FetchPluginMetadata(ctx)
}
