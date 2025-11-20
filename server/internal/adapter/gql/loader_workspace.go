package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"

	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
	"github.com/reearth/reearthx/util"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

type WorkspaceLoader struct {
	usecase accountinterfaces.Workspace
}

func NewWorkspaceLoader(usecase accountinterfaces.Workspace) *WorkspaceLoader {
	return &WorkspaceLoader{usecase: usecase}
}

func (c *WorkspaceLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
	uids, err := util.TryMap(ids, gqlmodel.ToID[accountsID.Workspace])
	if err != nil {
		return nil, []error{err}
	}

	// Convert new accountsID.WorkspaceID to old workspace.ID for the usecase call
	oldWIDs := make(workspace.IDList, 0, len(uids))
	for _, wid := range uids {
		oldID, _ := workspace.IDFrom(wid.String())
		oldWIDs = append(oldWIDs, oldID)
	}

	// Convert new operator to old operator
	oldOp := convertNewOperatorToOld(getAcOperator(ctx))

	res, err := c.usecase.Fetch(ctx, oldWIDs, oldOp)
	if err != nil {
		return nil, []error{err}
	}

	// Convert old workspace.Workspace to new accountsWorkspace.Workspace
	workspaces := make([]*gqlmodel.Workspace, 0, len(res))
	for _, t := range res {
		newWs := convertOldWorkspaceToNew(t)
		workspaces = append(workspaces, gqlmodel.ToWorkspace(newWs))
	}
	return workspaces, nil
}

func (c *WorkspaceLoader) FindByUser(ctx context.Context, uid gqlmodel.ID) ([]*gqlmodel.Workspace, error) {
	userid, err := gqlmodel.ToID[accountsID.User](uid)
	if err != nil {
		return nil, err
	}

	// Convert new accountsID.UserID to old user.ID
	oldUserID, _ := user.IDFrom(userid.String())

	// Convert new operator to old operator
	oldOp := convertNewOperatorToOld(getAcOperator(ctx))

	res, err := c.usecase.FindByUser(ctx, oldUserID, oldOp)
	if err != nil {
		return nil, err
	}

	// Convert old workspace.Workspace to new accountsWorkspace.Workspace
	workspaces := make([]*gqlmodel.Workspace, 0, len(res))
	for _, t := range res {
		newWs := convertOldWorkspaceToNew(t)
		workspaces = append(workspaces, gqlmodel.ToWorkspace(newWs))
	}
	return workspaces, nil
}

// data loader

type WorkspaceDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Workspace, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Workspace, []error)
}

func (c *WorkspaceLoader) DataLoader(ctx context.Context) WorkspaceDataLoader {
	return gqldataloader.NewWorkspaceLoader(gqldataloader.WorkspaceLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *WorkspaceLoader) OrdinaryDataLoader(ctx context.Context) WorkspaceDataLoader {
	return &ordinaryWorkspaceLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryWorkspaceLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Workspace, []error)
}

func (l *ordinaryWorkspaceLoader) Load(key gqlmodel.ID) (*gqlmodel.Workspace, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryWorkspaceLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
	return l.fetch(keys)
}

// Helper functions to convert between old reearthx workspace types and new reearth-accounts workspace types
func convertOldWorkspaceToNew(oldWs *workspace.Workspace) *accountsWorkspace.Workspace {
	if oldWs == nil {
		return nil
	}

	// Convert ID
	newID, _ := accountsID.WorkspaceIDFrom(oldWs.ID().String())

	// Convert members
	oldMembers := oldWs.Members().Users()
	newMembers := make(map[accountsID.UserID]accountsWorkspace.Member)
	for uid, member := range oldMembers {
		newUID, _ := accountsID.UserIDFrom(uid.String())
		newMembers[newUID] = accountsWorkspace.Member{
			Role: accountsWorkspace.Role(member.Role),
		}
	}

	// Convert policy ID if exists
	var newPolicyID *accountsWorkspace.PolicyID
	if oldPolicy := oldWs.Policy(); oldPolicy != nil {
		policyID := accountsWorkspace.PolicyID(*oldPolicy)
		newPolicyID = &policyID
	}

	// Build new workspace
	newWs, _ := accountsWorkspace.New().
		ID(newID).
		Name(oldWs.Name()).
		Members(newMembers).
		Personal(oldWs.IsPersonal()).
		Policy(newPolicyID).
		Build()

	return newWs
}

func convertNewOperatorToOld(newOp *accountsUsecase.Operator) *accountusecase.Operator {
	if newOp == nil {
		return nil
	}

	// Convert user ID
	var oldUserID *user.ID
	if newOp.User != nil {
		uid, _ := user.IDFrom(newOp.User.String())
		oldUserID = &uid
	}

	// Convert workspace IDs
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

	// Convert policy ID
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
