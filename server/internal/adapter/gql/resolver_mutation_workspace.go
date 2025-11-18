package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

var ErrWorkspaceNotAvailable = errors.New("workspace operations are not available during migration")

// TODO: Re-implement these mutations when Workspace usecase is available after migration
// Workspace management has been migrated to reearth-accounts

func (r *mutationResolver) CreateWorkspace(ctx context.Context, input gqlmodel.CreateWorkspaceInput) (*gqlmodel.CreateWorkspacePayload, error) {
	_ = input
	_ = ctx
	return nil, ErrWorkspaceNotAvailable
}

func (r *mutationResolver) DeleteWorkspace(ctx context.Context, input gqlmodel.DeleteWorkspaceInput) (*gqlmodel.DeleteWorkspacePayload, error) {
	_ = input
	_ = ctx
	return nil, ErrWorkspaceNotAvailable
}

func (r *mutationResolver) UpdateWorkspace(ctx context.Context, input gqlmodel.UpdateWorkspaceInput) (*gqlmodel.UpdateWorkspacePayload, error) {
	_ = input
	_ = ctx
	return nil, ErrWorkspaceNotAvailable
}

func (r *mutationResolver) AddMemberToWorkspace(ctx context.Context, input gqlmodel.AddMemberToWorkspaceInput) (*gqlmodel.AddMemberToWorkspacePayload, error) {
	_ = input
	_ = ctx
	return nil, ErrWorkspaceNotAvailable
}

func (r *mutationResolver) RemoveMemberFromWorkspace(ctx context.Context, input gqlmodel.RemoveMemberFromWorkspaceInput) (*gqlmodel.RemoveMemberFromWorkspacePayload, error) {
	_ = input
	_ = ctx
	return nil, ErrWorkspaceNotAvailable
}

func (r *mutationResolver) UpdateMemberOfWorkspace(ctx context.Context, input gqlmodel.UpdateMemberOfWorkspaceInput) (*gqlmodel.UpdateMemberOfWorkspacePayload, error) {
	_ = input
	_ = ctx
	return nil, ErrWorkspaceNotAvailable
}
