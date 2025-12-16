package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"

	accountsGqlWorkspace "github.com/reearth/reearth-accounts/server/pkg/gqlclient/workspace"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func (r *mutationResolver) CreateWorkspace(ctx context.Context, input gqlmodel.CreateWorkspaceInput) (*gqlmodel.CreateWorkspacePayload, error) {

	// Call reearth-accounts API
	alias := ""
	if input.Alias != nil {
		alias = *input.Alias
	}

	createInput := accountsGqlWorkspace.CreateWorkspaceInput{
		Alias:       alias,
		Name:        input.Name,
		Description: nil, // gqlmodel doesn't have description field
	}

	workspace, err := r.AccountsAPIClient.WorkspaceRepo.CreateWorkspace(ctx, createInput)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

func (r *mutationResolver) DeleteWorkspace(ctx context.Context, input gqlmodel.DeleteWorkspaceInput) (*gqlmodel.DeleteWorkspacePayload, error) {

	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if err := r.AccountsAPIClient.WorkspaceRepo.DeleteWorkspace(ctx, tid.String()); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteWorkspacePayload{WorkspaceID: input.WorkspaceID}, nil
}

func (r *mutationResolver) UpdateWorkspace(ctx context.Context, input gqlmodel.UpdateWorkspaceInput) (*gqlmodel.UpdateWorkspacePayload, error) {

	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	// Call reearth-accounts API
	updateInput := accountsGqlWorkspace.UpdateWorkspaceInput{
		WorkspaceID: tid.String(),
		Name:        input.Name,
	}

	workspace, err := r.AccountsAPIClient.WorkspaceRepo.UpdateWorkspace(ctx, updateInput)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

func (r *mutationResolver) AddMemberToWorkspace(ctx context.Context, input gqlmodel.AddMemberToWorkspaceInput) (*gqlmodel.AddMemberToWorkspacePayload, error) {

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	// Call reearth-accounts API
	addInput := accountsGqlWorkspace.AddUsersToWorkspaceInput{
		WorkspaceID: tid.String(),
		Users: []accountsGqlWorkspace.MemberInput{
			{
				UserID: uid.String(),
				Role:   string(input.Role),
			},
		},
	}

	workspace, err := r.AccountsAPIClient.WorkspaceRepo.AddUsersToWorkspace(ctx, addInput)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

func (r *mutationResolver) RemoveMemberFromWorkspace(ctx context.Context, input gqlmodel.RemoveMemberFromWorkspaceInput) (*gqlmodel.RemoveMemberFromWorkspacePayload, error) {

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	workspace, err := r.AccountsAPIClient.WorkspaceRepo.RemoveUserFromWorkspace(ctx, tid.String(), uid.String())
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}

func (r *mutationResolver) UpdateMemberOfWorkspace(ctx context.Context, input gqlmodel.UpdateMemberOfWorkspaceInput) (*gqlmodel.UpdateMemberOfWorkspacePayload, error) {

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	// Call reearth-accounts API
	updateInput := accountsGqlWorkspace.UpdateUserOfWorkspaceInput{
		WorkspaceID: tid.String(),
		UserID:      uid.String(),
		Role:        string(input.Role),
	}

	workspace, err := r.AccountsAPIClient.WorkspaceRepo.UpdateUserOfWorkspace(ctx, updateInput)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspaceFromAccounts(workspace)}, nil
}
