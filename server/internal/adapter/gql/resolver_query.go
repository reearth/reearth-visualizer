package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase"
)

func (r *Resolver) Query() QueryResolver {
	return &queryResolver{r}
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) Assets(ctx context.Context, teamID gqlmodel.ID, keyword *string, sortType *gqlmodel.AssetSortType, pagination *gqlmodel.Pagination) (*gqlmodel.AssetConnection, error) {
	return loaders(ctx).Asset.FindByTeam(ctx, teamID, keyword, gqlmodel.AssetSortTypeFrom(sortType), pagination)
}

func (r *queryResolver) Me(ctx context.Context) (*gqlmodel.Me, error) {
	u := getUser(ctx)
	if u == nil {
		return nil, nil
	}
	return gqlmodel.ToMe(u), nil
}

func (r *queryResolver) Node(ctx context.Context, i gqlmodel.ID, typeArg gqlmodel.NodeType) (gqlmodel.Node, error) {
	dataloaders := dataloaders(ctx)
	switch typeArg {
	case gqlmodel.NodeTypeAsset:
		result, err := dataloaders.Asset.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeDataset:
		result, err := dataloaders.Dataset.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeDatasetSchema:
		result, err := dataloaders.DatasetSchema.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeLayerItem:
		result, err := dataloaders.LayerItem.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeLayerGroup:
		result, err := dataloaders.LayerGroup.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeProject:
		result, err := dataloaders.Project.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeProperty:
		result, err := dataloaders.Property.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeScene:
		result, err := dataloaders.Scene.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeTeam:
		result, err := dataloaders.Team.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeUser:
		result, err := dataloaders.User.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	}
	return nil, nil
}

func (r *queryResolver) Nodes(ctx context.Context, ids []gqlmodel.ID, typeArg gqlmodel.NodeType) ([]gqlmodel.Node, error) {
	dataloaders := dataloaders(ctx)
	switch typeArg {
	case gqlmodel.NodeTypeAsset:
		data, err := dataloaders.Asset.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeDataset:
		data, err := dataloaders.Dataset.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeDatasetSchema:
		data, err := dataloaders.DatasetSchema.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeLayerItem:
		data, err := dataloaders.LayerItem.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = *data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeLayerGroup:
		data, err := dataloaders.LayerGroup.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = *data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeProject:
		data, err := dataloaders.Project.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeProperty:
		data, err := dataloaders.Property.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeScene:
		data, err := dataloaders.Scene.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeTeam:
		data, err := dataloaders.Team.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeUser:
		data, err := dataloaders.User.LoadAll(ids)
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

func (r *queryResolver) PropertySchema(ctx context.Context, i gqlmodel.ID) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(i)
}

func (r *queryResolver) PropertySchemas(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.PropertySchema, error) {
	data, err := dataloaders(ctx).PropertySchema.LoadAll(ids)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return data, nil
}

func (r *queryResolver) Plugin(ctx context.Context, id gqlmodel.ID) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(id)
}

func (r *queryResolver) Plugins(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Plugin, error) {
	data, err := dataloaders(ctx).Plugin.LoadAll(ids)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return data, nil
}

func (r *queryResolver) Layer(ctx context.Context, layerID gqlmodel.ID) (gqlmodel.Layer, error) {
	result, err := dataloaders(ctx).Layer.Load(layerID)
	if result == nil || *result == nil {
		return nil, nil
	}
	return *result, err
}

func (r *queryResolver) Scene(ctx context.Context, projectID gqlmodel.ID) (*gqlmodel.Scene, error) {
	return loaders(ctx).Scene.FindByProject(ctx, projectID)
}

func (r *queryResolver) Projects(ctx context.Context, teamID gqlmodel.ID, includeArchived *bool, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindByTeam(ctx, teamID, first, last, before, after)
}

func (r *queryResolver) DatasetSchemas(ctx context.Context, sceneID gqlmodel.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.DatasetSchemaConnection, error) {
	return loaders(ctx).Dataset.FindSchemaByScene(ctx, sceneID, first, last, before, after)
}

func (r *queryResolver) DynamicDatasetSchemas(ctx context.Context, sceneID gqlmodel.ID) ([]*gqlmodel.DatasetSchema, error) {
	return loaders(ctx).Dataset.FindDynamicSchemasByScene(ctx, sceneID)
}

func (r *queryResolver) Datasets(ctx context.Context, datasetSchemaID gqlmodel.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.DatasetConnection, error) {
	return loaders(ctx).Dataset.FindBySchema(ctx, datasetSchemaID, first, last, before, after)
}

func (r *queryResolver) SearchUser(ctx context.Context, nameOrEmail string) (*gqlmodel.User, error) {
	return loaders(ctx).User.SearchUser(ctx, nameOrEmail)
}

func (r *queryResolver) CheckProjectAlias(ctx context.Context, alias string) (*gqlmodel.ProjectAliasAvailability, error) {
	return loaders(ctx).Project.CheckAlias(ctx, alias)
}
