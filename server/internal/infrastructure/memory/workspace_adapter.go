package memory

import (
	"context"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/usecasex"
)

// WorkspaceAdapter adapts old reearthx memory workspace repo to new interface
type WorkspaceAdapter struct {
	inner *accountmemory.Workspace
}

func NewWorkspaceAdapter() accountsRepo.Workspace {
	return &WorkspaceAdapter{
		inner: accountmemory.NewWorkspace(),
	}
}

func (a *WorkspaceAdapter) Filtered(f accountsRepo.WorkspaceFilter) accountsRepo.Workspace {
	// For memory implementation, filtering is not implemented
	return a
}

func (a *WorkspaceAdapter) FindByID(ctx context.Context, wsid accountsID.WorkspaceID) (*accountsWorkspace.Workspace, error) {
	oldID, _ := workspace.IDFrom(wsid.String())
	oldWs, err := a.inner.FindByID(ctx, oldID)
	if err != nil {
		return nil, err
	}
	return convertOldWorkspaceToNew(oldWs), nil
}

func (a *WorkspaceAdapter) FindByName(ctx context.Context, name string) (*accountsWorkspace.Workspace, error) {
	oldWs, err := a.inner.FindByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return convertOldWorkspaceToNew(oldWs), nil
}

func (a *WorkspaceAdapter) FindByAlias(ctx context.Context, alias string) (*accountsWorkspace.Workspace, error) {
	oldWs, err := a.inner.FindByAlias(ctx, alias)
	if err != nil {
		return nil, err
	}
	return convertOldWorkspaceToNew(oldWs), nil
}

func (a *WorkspaceAdapter) FindByIDs(ctx context.Context, ids accountsID.WorkspaceIDList) ([]*accountsWorkspace.Workspace, error) {
	oldIDs := make(workspace.IDList, 0, len(ids))
	for _, id := range ids {
		oldID, _ := workspace.IDFrom(id.String())
		oldIDs = append(oldIDs, oldID)
	}

	oldWorkspaces, err := a.inner.FindByIDs(ctx, oldIDs)
	if err != nil {
		return nil, err
	}

	newWorkspaces := make([]*accountsWorkspace.Workspace, 0, len(oldWorkspaces))
	for _, oldWs := range oldWorkspaces {
		newWorkspaces = append(newWorkspaces, convertOldWorkspaceToNew(oldWs))
	}
	return newWorkspaces, nil
}

func (a *WorkspaceAdapter) FindByUser(ctx context.Context, uid accountsID.UserID) ([]*accountsWorkspace.Workspace, error) {
	oldUID, _ := user.IDFrom(uid.String())
	oldWorkspaces, err := a.inner.FindByUser(ctx, oldUID)
	if err != nil {
		return nil, err
	}

	newWorkspaces := make([]*accountsWorkspace.Workspace, 0, len(oldWorkspaces))
	for _, oldWs := range oldWorkspaces {
		newWorkspaces = append(newWorkspaces, convertOldWorkspaceToNew(oldWs))
	}
	return newWorkspaces, nil
}

func (a *WorkspaceAdapter) FindByUserWithPagination(ctx context.Context, uid accountsID.UserID, pagination *usecasex.Pagination) ([]*accountsWorkspace.Workspace, *usecasex.PageInfo, error) {
	// Not implemented in memory
	return nil, nil, nil
}

func (a *WorkspaceAdapter) FindByIntegration(ctx context.Context, iid accountsID.IntegrationID) ([]*accountsWorkspace.Workspace, error) {
	// Not implemented in memory
	return nil, nil
}

func (a *WorkspaceAdapter) FindByIntegrations(ctx context.Context, iids accountsID.IntegrationIDList) ([]*accountsWorkspace.Workspace, error) {
	// Not implemented in memory
	return nil, nil
}

func (a *WorkspaceAdapter) CheckWorkspaceAliasUnique(ctx context.Context, wsid accountsID.WorkspaceID, alias string) error {
	oldID, _ := workspace.IDFrom(wsid.String())
	return a.inner.CheckWorkspaceAliasUnique(ctx, oldID, alias)
}

func (a *WorkspaceAdapter) Create(ctx context.Context, ws *accountsWorkspace.Workspace) error {
	oldWs := convertNewWorkspaceToOld(ws)
	return a.inner.Create(ctx, oldWs)
}

func (a *WorkspaceAdapter) Save(ctx context.Context, ws *accountsWorkspace.Workspace) error {
	oldWs := convertNewWorkspaceToOld(ws)
	return a.inner.Save(ctx, oldWs)
}

func (a *WorkspaceAdapter) SaveAll(ctx context.Context, wsList []*accountsWorkspace.Workspace) error {
	oldWorkspaces := make([]*workspace.Workspace, 0, len(wsList))
	for _, ws := range wsList {
		oldWorkspaces = append(oldWorkspaces, convertNewWorkspaceToOld(ws))
	}
	return a.inner.SaveAll(ctx, oldWorkspaces)
}

func (a *WorkspaceAdapter) Remove(ctx context.Context, wsid accountsID.WorkspaceID) error {
	oldID, _ := workspace.IDFrom(wsid.String())
	return a.inner.Remove(ctx, oldID)
}

func (a *WorkspaceAdapter) RemoveAll(ctx context.Context, ids accountsID.WorkspaceIDList) error {
	oldIDs := make(workspace.IDList, 0, len(ids))
	for _, id := range ids {
		oldID, _ := workspace.IDFrom(id.String())
		oldIDs = append(oldIDs, oldID)
	}
	return a.inner.RemoveAll(ctx, oldIDs)
}

// Helper conversion functions
func convertOldWorkspaceToNew(oldWs *workspace.Workspace) *accountsWorkspace.Workspace {
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

func convertNewWorkspaceToOld(newWs *accountsWorkspace.Workspace) *workspace.Workspace {
	if newWs == nil {
		return nil
	}

	oldID, _ := workspace.IDFrom(newWs.ID().String())

	newMembers := newWs.Members().Users()
	oldMembers := make(map[user.ID]workspace.Member)
	for uid, member := range newMembers {
		oldUID, _ := user.IDFrom(uid.String())
		oldMembers[oldUID] = workspace.Member{
			Role: workspace.Role(member.Role),
		}
	}

	var oldPolicyID *workspace.PolicyID
	if newPolicy := newWs.Policy(); newPolicy != nil {
		policyID := workspace.PolicyID(*newPolicy)
		oldPolicyID = &policyID
	}

	oldWs, _ := workspace.New().
		ID(oldID).
		Name(newWs.Name()).
		Members(oldMembers).
		Personal(newWs.IsPersonal()).
		Policy(oldPolicyID).
		Build()

	return oldWs
}
