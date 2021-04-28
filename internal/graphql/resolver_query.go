package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Query() QueryResolver {
	return &queryResolver{r}
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) Assets(ctx context.Context, teamID id.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*graphql1.AssetConnection, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.AssetController.FindByTeam(ctx, teamID, first, last, before, after, getOperator(ctx))
}

func (r *queryResolver) Me(ctx context.Context) (*graphql1.User, error) {
	exit := trace(ctx)
	defer exit()

	u := getUser(ctx)
	if u == nil {
		return nil, nil
	}
	return graphql1.ToUser(u), nil
}

func (r *queryResolver) Node(ctx context.Context, i id.ID, typeArg graphql1.NodeType) (graphql1.Node, error) {
	exit := trace(ctx)
	defer exit()

	dataloaders := dataloader.DataLoadersFromContext(ctx)
	switch typeArg {
	case graphql1.NodeTypeDataset:
		result, err := dataloaders.Dataset.Load(id.DatasetID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case graphql1.NodeTypeDatasetSchema:
		result, err := dataloaders.DatasetSchema.Load(id.DatasetSchemaID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case graphql1.NodeTypeLayerItem:
		result, err := dataloaders.LayerItem.Load(id.LayerID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case graphql1.NodeTypeLayerGroup:
		result, err := dataloaders.LayerGroup.Load(id.LayerID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case graphql1.NodeTypeProject:
		result, err := dataloaders.Project.Load(id.ProjectID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case graphql1.NodeTypeProperty:
		result, err := dataloaders.Property.Load(id.PropertyID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case graphql1.NodeTypeScene:
		result, err := dataloaders.Scene.Load(id.SceneID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case graphql1.NodeTypeTeam:
		result, err := dataloaders.Team.Load(id.TeamID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	case graphql1.NodeTypeUser:
		result, err := dataloaders.User.Load(id.UserID(i))
		if result == nil {
			return nil, nil
		}
		return result, err
	}
	return nil, nil
}

func (r *queryResolver) Nodes(ctx context.Context, ids []*id.ID, typeArg graphql1.NodeType) ([]graphql1.Node, error) {
	exit := trace(ctx)
	defer exit()

	dataloaders := dataloader.DataLoadersFromContext(ctx)
	switch typeArg {
	case graphql1.NodeTypeDataset:
		data, err := dataloaders.Dataset.LoadAll(id.DatasetIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case graphql1.NodeTypeDatasetSchema:
		data, err := dataloaders.DatasetSchema.LoadAll(id.DatasetSchemaIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case graphql1.NodeTypeLayerItem:
		data, err := dataloaders.LayerItem.LoadAll(id.LayerIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = *data[i]
		}
		return nodes, nil
	case graphql1.NodeTypeLayerGroup:
		data, err := dataloaders.LayerGroup.LoadAll(id.LayerIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = *data[i]
		}
		return nodes, nil
	case graphql1.NodeTypeProject:
		data, err := dataloaders.Project.LoadAll(id.ProjectIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case graphql1.NodeTypeProperty:
		data, err := dataloaders.Property.LoadAll(id.PropertyIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case graphql1.NodeTypeScene:
		data, err := dataloaders.Scene.LoadAll(id.SceneIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case graphql1.NodeTypeTeam:
		data, err := dataloaders.Team.LoadAll(id.TeamIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case graphql1.NodeTypeUser:
		data, err := dataloaders.User.LoadAll(id.UserIDsFromIDRef(ids))
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]graphql1.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	default:
		return nil, nil
	}
}

func (r *queryResolver) PropertySchema(ctx context.Context, i id.PropertySchemaID) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(i)
}

func (r *queryResolver) PropertySchemas(ctx context.Context, ids []*id.PropertySchemaID) ([]*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	ids2 := make([]id.PropertySchemaID, 0, len(ids))
	for _, i := range ids {
		if i != nil {
			ids2 = append(ids2, *i)
		}
	}

	data, err := dataloader.DataLoadersFromContext(ctx).PropertySchema.LoadAll(ids2)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}

	return data, nil
}

func (r *queryResolver) Plugin(ctx context.Context, id id.PluginID) (*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Plugin.Load(id)
}

func (r *queryResolver) Plugins(ctx context.Context, ids []*id.PluginID) ([]*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	ids2 := make([]id.PluginID, 0, len(ids))
	for _, i := range ids {
		if i != nil {
			ids2 = append(ids2, *i)
		}
	}

	data, err := dataloader.DataLoadersFromContext(ctx).Plugin.LoadAll(ids2)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}

	return data, nil
}

func (r *queryResolver) Layer(ctx context.Context, layerID id.ID) (graphql1.Layer, error) {
	exit := trace(ctx)
	defer exit()

	dataloaders := dataloader.DataLoadersFromContext(ctx)
	result, err := dataloaders.Layer.Load(id.LayerID(layerID))
	if result == nil || *result == nil {
		return nil, nil
	}
	return *result, err
}

func (r *queryResolver) Scene(ctx context.Context, projectID id.ID) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.FindByProject(ctx, id.ProjectID(projectID), getOperator(ctx))
}

func (r *queryResolver) Projects(ctx context.Context, teamID id.ID, includeArchived *bool, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*graphql1.ProjectConnection, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.ProjectController.FindByTeam(ctx, id.TeamID(teamID), first, last, before, after, getOperator(ctx))
}

func (r *queryResolver) DatasetSchemas(ctx context.Context, sceneID id.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*graphql1.DatasetSchemaConnection, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.FindSchemaByScene(ctx, sceneID, first, last, before, after, getOperator(ctx))
}

func (r *queryResolver) DynamicDatasetSchemas(ctx context.Context, sceneID id.ID) ([]*graphql1.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.FindDynamicSchemasByScene(ctx, sceneID)
}

func (r *queryResolver) Datasets(ctx context.Context, datasetSchemaID id.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*graphql1.DatasetConnection, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.FindBySchema(ctx, datasetSchemaID, first, last, before, after, getOperator(ctx))
}

func (r *queryResolver) SceneLock(ctx context.Context, sceneID id.ID) (*graphql1.SceneLockMode, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.FetchLock(ctx, id.SceneID(sceneID), getOperator(ctx))
}

func (r *queryResolver) SearchUser(ctx context.Context, nameOrEmail string) (*graphql1.SearchedUser, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.UserController.SearchUser(ctx, nameOrEmail, getOperator(ctx))
}

func (r *queryResolver) CheckProjectAlias(ctx context.Context, alias string) (*graphql1.CheckProjectAliasPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.ProjectController.CheckAlias(ctx, alias)
}
