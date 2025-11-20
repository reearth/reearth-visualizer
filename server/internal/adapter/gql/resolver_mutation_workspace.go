package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

func (r *mutationResolver) CreateWorkspace(ctx context.Context, input gqlmodel.CreateWorkspaceInput) (*gqlmodel.CreateWorkspacePayload, error) {
	userID := getUser(ctx).ID()

	// Create new workspace
	members := map[accountsID.UserID]accountsWorkspace.Member{
		userID: {Role: accountsWorkspace.RoleOwner},
	}

	builder := accountsWorkspace.New().
		ID(accountsID.NewWorkspaceID()).
		Name(input.Name).
		Members(members).
		Personal(false).
		Metadata(accountsWorkspace.NewMetadata())

	if input.Alias != nil {
		builder = builder.Alias(*input.Alias)
	}

	ws, err := builder.Build()
	if err != nil {
		return nil, err
	}

	if err := acRepos(ctx).Workspace.Create(ctx, ws); err != nil {
		return nil, err
	}

	return &gqlmodel.CreateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(ws)}, nil
}

func (r *mutationResolver) DeleteWorkspace(ctx context.Context, input gqlmodel.DeleteWorkspaceInput) (*gqlmodel.DeleteWorkspacePayload, error) {
	wid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if err := acRepos(ctx).Workspace.Remove(ctx, wid); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteWorkspacePayload{WorkspaceID: input.WorkspaceID}, nil
}

func (r *mutationResolver) UpdateWorkspace(ctx context.Context, input gqlmodel.UpdateWorkspaceInput) (*gqlmodel.UpdateWorkspacePayload, error) {
	wid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	ws, err := acRepos(ctx).Workspace.FindByID(ctx, wid)
	if err != nil {
		return nil, err
	}

	if input.Name != "" {
		ws.Rename(input.Name)
	}

	if input.Alias != nil {
		ws.UpdateAlias(*input.Alias)
	}

	if err := acRepos(ctx).Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(ws)}, nil
}

func (r *mutationResolver) AddMemberToWorkspace(ctx context.Context, input gqlmodel.AddMemberToWorkspaceInput) (*gqlmodel.AddMemberToWorkspacePayload, error) {
	wid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	ws, err := acRepos(ctx).Workspace.FindByID(ctx, wid)
	if err != nil {
		return nil, err
	}

	// Get the user to add
	u, err := acRepos(ctx).User.FindByID(ctx, uid)
	if err != nil {
		return nil, err
	}

	currentUserID := getUser(ctx).ID()
	role := accountsWorkspace.Role(gqlmodel.FromRole(input.Role))

	if err := ws.Members().Join(u, role, currentUserID); err != nil {
		return nil, err
	}

	if err := acRepos(ctx).Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspace(ws)}, nil
}

func (r *mutationResolver) RemoveMemberFromWorkspace(ctx context.Context, input gqlmodel.RemoveMemberFromWorkspaceInput) (*gqlmodel.RemoveMemberFromWorkspacePayload, error) {
	wid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	ws, err := acRepos(ctx).Workspace.FindByID(ctx, wid)
	if err != nil {
		return nil, err
	}

	if err := ws.Members().Leave(uid); err != nil {
		return nil, err
	}

	if err := acRepos(ctx).Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspace(ws)}, nil
}

func (r *mutationResolver) UpdateMemberOfWorkspace(ctx context.Context, input gqlmodel.UpdateMemberOfWorkspaceInput) (*gqlmodel.UpdateMemberOfWorkspacePayload, error) {
	wid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	ws, err := acRepos(ctx).Workspace.FindByID(ctx, wid)
	if err != nil {
		return nil, err
	}

	role := accountsWorkspace.Role(gqlmodel.FromRole(input.Role))
	if err := ws.Members().UpdateUserRole(uid, role); err != nil {
		return nil, err
	}

	if err := acRepos(ctx).Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspace(ws)}, nil
}
