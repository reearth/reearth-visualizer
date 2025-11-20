package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func (r *Resolver) Query() QueryResolver {
	return &queryResolver{r}
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) Assets(ctx context.Context, workspaceID gqlmodel.ID, projectId *gqlmodel.ID, pagination *gqlmodel.Pagination, keyword *string, sortType *gqlmodel.AssetSort) (*gqlmodel.AssetConnection, error) {
	return loaders(ctx).Asset.FindByWorkspace(ctx, workspaceID, projectId, keyword, gqlmodel.AssetSortTypeFrom(sortType), pagination)
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
	case gqlmodel.NodeTypeWorkspace:
		result, err := dataloaders.Workspace.Load(i)
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
	case gqlmodel.NodeTypeWorkspace:
		data, err := dataloaders.Workspace.LoadAll(ids)
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

func (r *queryResolver) Scene(ctx context.Context, projectID gqlmodel.ID) (*gqlmodel.Scene, error) {
	return loaders(ctx).Scene.FindByProject(ctx, projectID)
}

func (r *queryResolver) Projects(ctx context.Context, workspaceID gqlmodel.ID, pagination *gqlmodel.Pagination, keyword *string, sortType *gqlmodel.ProjectSort) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindByWorkspace(ctx, workspaceID, keyword, gqlmodel.ProjectSortTypeFrom(sortType), pagination)
}

func (r *queryResolver) SearchUser(ctx context.Context, nameOrEmail string) (*gqlmodel.User, error) {
	return loaders(ctx).User.SearchUser(ctx, nameOrEmail)
}

func (r *queryResolver) CheckProjectAlias(ctx context.Context, alias string, workspaceId gqlmodel.ID, projectId *gqlmodel.ID) (*gqlmodel.ProjectAliasAvailability, error) {
	return loaders(ctx).Project.CheckProjectAlias(ctx, alias, workspaceId, projectId)
}

func (r *queryResolver) CheckSceneAlias(ctx context.Context, alias string, projectId *gqlmodel.ID) (*gqlmodel.SceneAliasAvailability, error) {
	return loaders(ctx).Project.CheckSceneAlias(ctx, alias, projectId)
}

func (r *queryResolver) CheckStoryAlias(ctx context.Context, alias string, storyId *gqlmodel.ID) (*gqlmodel.StoryAliasAvailability, error) {
	return loaders(ctx).Story.CheckStorytellingAlias(ctx, alias, storyId)
}

func (r *queryResolver) StarredProjects(ctx context.Context, workspaceId gqlmodel.ID) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindStarredByWorkspace(ctx, workspaceId)
}

func (r *queryResolver) DeletedProjects(ctx context.Context, workspaceId gqlmodel.ID) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindDeletedByWorkspace(ctx, workspaceId)
}

func (r *queryResolver) VisibilityProjects(ctx context.Context, authenticated bool, workspaceId gqlmodel.ID) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.VisibilityByWorkspace(ctx, workspaceId, authenticated)
}

func (r *queryResolver) WorkspacePolicyCheck(ctx context.Context, input gqlmodel.PolicyCheckInput) (*gqlmodel.PolicyCheckPayload, error) {
	wid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	policy, err := usecases(ctx).Policy.GetWorkspacePolicy(ctx, wid)
	if err != nil {
		return nil, err
	}
	return &gqlmodel.PolicyCheckPayload{
		WorkspaceID:                  input.WorkspaceID,
		EnableToCreatePrivateProject: policy.EnableToCreatePrivateProject,
	}, nil
}
