package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

func (r *mutationResolver) CreateWorkspace(ctx context.Context, input gqlmodel.CreateWorkspaceInput) (*gqlmodel.CreateWorkspacePayload, error) {
	// Convert new user ID to old user ID
	newUserID := getUser(ctx).ID()
	oldUserID, _ := user.IDFrom(newUserID.String())

	// Convert new operator to old operator
	oldOp := convertNewOperatorToOldForResolver(getAcOperator(ctx))

	res, err := usecases(ctx).Workspace.Create(ctx, input.Name, oldUserID, input.Alias, oldOp)
	if err != nil {
		return nil, err
	}

	// Convert old workspace to new workspace
	newWs := convertOldWorkspaceToNewForResolver(res)
	return &gqlmodel.CreateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(newWs)}, nil
}

func (r *mutationResolver) DeleteWorkspace(ctx context.Context, input gqlmodel.DeleteWorkspaceInput) (*gqlmodel.DeleteWorkspacePayload, error) {
	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	// Convert to old types
	oldWID, _ := workspace.IDFrom(tid.String())
	oldOp := convertNewOperatorToOldForResolver(getAcOperator(ctx))

	if err := usecases(ctx).Workspace.Remove(ctx, oldWID, oldOp); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteWorkspacePayload{WorkspaceID: input.WorkspaceID}, nil
}

func (r *mutationResolver) UpdateWorkspace(ctx context.Context, input gqlmodel.UpdateWorkspaceInput) (*gqlmodel.UpdateWorkspacePayload, error) {
	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	// Convert to old types
	oldWID, _ := workspace.IDFrom(tid.String())
	oldOp := convertNewOperatorToOldForResolver(getAcOperator(ctx))

	res, err := usecases(ctx).Workspace.Update(ctx, oldWID, input.Name, input.Alias, oldOp)
	if err != nil {
		return nil, err
	}

	newWs := convertOldWorkspaceToNewForResolver(res)
	return &gqlmodel.UpdateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(newWs)}, nil
}

func (r *mutationResolver) AddMemberToWorkspace(ctx context.Context, input gqlmodel.AddMemberToWorkspaceInput) (*gqlmodel.AddMemberToWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	// Convert to old types
	oldWID, _ := workspace.IDFrom(tid.String())
	oldUID, _ := user.IDFrom(uid.String())
	oldRole := workspace.Role(gqlmodel.FromRole(input.Role))
	oldOp := convertNewOperatorToOldForResolver(getAcOperator(ctx))

	res, err := usecases(ctx).Workspace.AddUserMember(ctx, oldWID, map[user.ID]workspace.Role{oldUID: oldRole}, oldOp)
	if err != nil {
		return nil, err
	}

	newWs := convertOldWorkspaceToNewForResolver(res)
	return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspace(newWs)}, nil
}

func (r *mutationResolver) RemoveMemberFromWorkspace(ctx context.Context, input gqlmodel.RemoveMemberFromWorkspaceInput) (*gqlmodel.RemoveMemberFromWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	// Convert to old types
	oldWID, _ := workspace.IDFrom(tid.String())
	oldUID, _ := user.IDFrom(uid.String())
	oldOp := convertNewOperatorToOldForResolver(getAcOperator(ctx))

	res, err := usecases(ctx).Workspace.RemoveUserMember(ctx, oldWID, oldUID, oldOp)
	if err != nil {
		return nil, err
	}

	newWs := convertOldWorkspaceToNewForResolver(res)
	return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspace(newWs)}, nil
}

func (r *mutationResolver) UpdateMemberOfWorkspace(ctx context.Context, input gqlmodel.UpdateMemberOfWorkspaceInput) (*gqlmodel.UpdateMemberOfWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	// Convert to old types
	oldWID, _ := workspace.IDFrom(tid.String())
	oldUID, _ := user.IDFrom(uid.String())
	oldRole := workspace.Role(gqlmodel.FromRole(input.Role))
	oldOp := convertNewOperatorToOldForResolver(getAcOperator(ctx))

	res, err := usecases(ctx).Workspace.UpdateUserMember(ctx, oldWID, oldUID, oldRole, oldOp)
	if err != nil {
		return nil, err
	}

	newWs := convertOldWorkspaceToNewForResolver(res)
	return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspace(newWs)}, nil
}

// Conversion helper functions - these can be consolidated with loader_workspace.go in a future refactoring
func convertOldWorkspaceToNewForResolver(oldWs *workspace.Workspace) *accountsWorkspace.Workspace {
	if oldWs == nil {
		return nil
	}

	newID, _ := accountsID.WorkspaceIDFrom(oldWs.ID().String())

	oldMembers := oldWs.Members().Users()
	newMembers := make(map[accountsID.UserID]accountsWorkspace.Member)
	for uid, member := range oldMembers {
		newUID, _ := accountsID.UserIDFrom(uid.String())
		newMembers[newUID] = accountsWorkspace.Member{
			Role: accountsWorkspace.Role(member.Role),
		}
	}

	var newPolicyID *accountsWorkspace.PolicyID
	if oldPolicy := oldWs.Policy(); oldPolicy != nil {
		policyID := accountsWorkspace.PolicyID(*oldPolicy)
		newPolicyID = &policyID
	}

	newWs, _ := accountsWorkspace.New().
		ID(newID).
		Name(oldWs.Name()).
		Members(newMembers).
		Personal(oldWs.IsPersonal()).
		Policy(newPolicyID).
		Build()

	return newWs
}

func convertNewOperatorToOldForResolver(newOp *accountsUsecase.Operator) *accountusecase.Operator {
	if newOp == nil {
		return nil
	}

	var oldUserID *user.ID
	if newOp.User != nil {
		uid, _ := user.IDFrom(newOp.User.String())
		oldUserID = &uid
	}

	oldReadable := make(workspace.IDList, 0, len(newOp.ReadableWorkspaces))
	for _, wid := range newOp.ReadableWorkspaces {
		oldID, _ := workspace.IDFrom(wid.String())
		oldReadable = append(oldReadable, oldID)
	}

	oldWritable := make(workspace.IDList, 0, len(newOp.WritableWorkspaces))
	for _, wid := range newOp.WritableWorkspaces {
		oldID, _ := workspace.IDFrom(wid.String())
		oldWritable = append(oldWritable, oldID)
	}

	oldOwning := make(workspace.IDList, 0, len(newOp.OwningWorkspaces))
	for _, wid := range newOp.OwningWorkspaces {
		oldID, _ := workspace.IDFrom(wid.String())
		oldOwning = append(oldOwning, oldID)
	}

	oldMaintainable := make(workspace.IDList, 0, len(newOp.MaintainableWorkspaces))
	for _, wid := range newOp.MaintainableWorkspaces {
		oldID, _ := workspace.IDFrom(wid.String())
		oldMaintainable = append(oldMaintainable, oldID)
	}

	var oldPolicyID *workspace.PolicyID
	if newOp.DefaultPolicy != nil {
		policyID := workspace.PolicyID(*newOp.DefaultPolicy)
		oldPolicyID = &policyID
	}

	return &accountusecase.Operator{
		User:                   oldUserID,
		ReadableWorkspaces:     oldReadable,
		WritableWorkspaces:     oldWritable,
		OwningWorkspaces:       oldOwning,
		MaintainableWorkspaces: oldMaintainable,
		DefaultPolicy:          oldPolicyID,
	}
}
