package interactor

import (
	"context"
	"errors"
	"fmt"
	"strings"

	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	errInvalidOperator           = errors.New("invalid operator")
	errOwnerCannotLeaveWorkspace = errors.New("owner user cannot leave from the workspace")
	errCannotChangeOwnerRole     = errors.New("cannot change the role of the workspace owner")
)

type WorkspaceInteractor struct {
	repos     *accountsInfra.Container
	userquery interfaces.UserQuery
}

func NewWorkspaceInteractor(ar *accountsInfra.Container) interfaces.Workspace {
	return &WorkspaceInteractor{
		repos:     ar,
		userquery: NewUserQueryInteractor(ar),
	}
}

func (i *WorkspaceInteractor) Fetch(ctx context.Context, ids accountsWorkspace.IDList, operator *accountsWorkspace.Operator) (accountsWorkspace.List, error) {
	res, err := i.repos.Workspace.FindByIDs(ctx, ids)
	return filterWorkspacesAc(res, operator, err, false, true)
}

func (i *WorkspaceInteractor) FindByUser(ctx context.Context, id accountsUser.ID, operator *accountsWorkspace.Operator) (accountsWorkspace.List, error) {
	res, err := i.repos.Workspace.FindByUser(ctx, id)
	return filterWorkspacesAc(res, operator, err, true, true)
}

func (i *WorkspaceInteractor) Create(ctx context.Context, name string, firstUser accountsUser.ID, alias *string, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	if len(strings.TrimSpace(name)) == 0 {
		return nil, accountsUser.ErrInvalidName
	}

	firstUsers, err := i.userquery.FetchByID(ctx, []accountsUser.ID{firstUser})
	if err != nil || len(firstUsers) == 0 {
		if err == nil {
			return nil, rerror.ErrNotFound
		}
		return nil, err
	}

	builder := accountsWorkspace.New().
		NewID().
		Name(name)

	ws, err := builder.Build()
	if err != nil {
		return nil, err
	}

	// Set alias: use provided alias or default to "w-" + workspace ID
	wsAlias := fmt.Sprintf("w-%s", ws.ID().String())
	if alias != nil && *alias != "" {
		wsAlias = *alias
	}

	// Check for duplicate alias
	existing, err := i.repos.Workspace.FindByAlias(ctx, wsAlias)
	if err == nil && existing != nil {
		return nil, errors.New("alias is already used in another workspace")
	}

	ws.UpdateAlias(wsAlias)

	if err := ws.Members().Join(firstUsers[0], accountsRole.RoleOwner, *operator.User); err != nil {
		return nil, err
	}

	if err := i.repos.Workspace.Create(ctx, ws); err != nil {
		return nil, err
	}

	operator.AddNewWorkspace(ws.ID())
	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) Update(ctx context.Context, id accountsWorkspace.ID, name string, alias *string, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	ws, err := i.repos.Workspace.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if ws.IsPersonal() {
		return nil, accountsWorkspace.ErrCannotModifyPersonalWorkspace
	}
	if ws.Members().UserRole(*operator.User) != accountsRole.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if len(strings.TrimSpace(name)) == 0 {
		return nil, accountsUser.ErrInvalidName
	}

	ws.Rename(name)

	// Update alias if provided
	if alias != nil && *alias != "" {
		// Check for duplicate alias (allow if same workspace)
		existing, findErr := i.repos.Workspace.FindByAlias(ctx, *alias)
		if findErr == nil && existing != nil && existing.ID() != ws.ID() {
			return nil, errors.New("alias is already used in another workspace")
		}
		ws.UpdateAlias(*alias)
	}

	err = i.repos.Workspace.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) AddUserMember(ctx context.Context, workspaceID accountsWorkspace.ID, users map[accountsUser.ID]accountsRole.RoleType, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	ids := make([]accountsUser.ID, 0, len(users))
	for id := range users {
		ids = append(ids, id)
	}

	ul, err := i.userquery.FetchByID(ctx, ids)
	if err != nil {
		return nil, err
	}

	ws, err := i.repos.Workspace.FindByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	if ws.IsPersonal() {
		return nil, accountsWorkspace.ErrCannotModifyPersonalWorkspace
	}

	for _, m := range ul {
		if m == nil {
			continue
		}
		err = ws.Members().Join(m, users[m.ID()], *operator.User)
		if err != nil {
			return nil, err
		}
	}

	err = i.repos.Workspace.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) AddIntegrationMember(ctx context.Context, wId accountsWorkspace.ID, iId accountsWorkspace.IntegrationID, r accountsRole.RoleType, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	ws, err := i.repos.Workspace.FindByID(ctx, wId)
	if err != nil {
		return nil, err
	}

	err = ws.Members().AddIntegration(iId, r, *operator.User)
	if err != nil {
		return nil, err
	}

	err = i.repos.Workspace.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) UpdateUserMember(ctx context.Context, id accountsWorkspace.ID, u accountsUser.ID, r accountsRole.RoleType, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	if !operator.IsOwningWorkspace(id) {
		return nil, interfaces.ErrOperationDenied
	}

	ws, err := i.repos.Workspace.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if ws.IsPersonal() {
		return nil, accountsWorkspace.ErrCannotModifyPersonalWorkspace
	}

	if u == *operator.User {
		return nil, errCannotChangeOwnerRole
	}

	err = ws.Members().UpdateUserRole(u, r)
	if err != nil {
		return nil, err
	}

	err = i.repos.Workspace.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) UpdateIntegration(ctx context.Context, wId accountsWorkspace.ID, iId accountsWorkspace.IntegrationID, r accountsRole.RoleType, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	ws, err := i.repos.Workspace.FindByID(ctx, wId)
	if err != nil {
		return nil, err
	}

	err = ws.Members().UpdateIntegrationRole(iId, r)
	if err != nil {
		return nil, err
	}

	err = i.repos.Workspace.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) RemoveUserMember(ctx context.Context, id accountsWorkspace.ID, u accountsUser.ID, operator *accountsWorkspace.Operator) (*accountsWorkspace.Workspace, error) {
	return i.RemoveMultipleUserMembers(ctx, id, accountsUser.IDList{u}, operator)
}

func (i *WorkspaceInteractor) RemoveMultipleUserMembers(ctx context.Context, id accountsWorkspace.ID, userIds accountsUser.IDList, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	if userIds.Len() == 0 {
		return nil, accountsWorkspace.ErrNoSpecifiedUsers
	}

	ws, err := i.repos.Workspace.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if ws.IsPersonal() {
		return nil, accountsWorkspace.ErrCannotModifyPersonalWorkspace
	}

	isOwner := ws.Members().UserRole(*operator.User) == accountsRole.RoleOwner

	for _, uId := range userIds {
		isSelfLeave := *operator.User == uId

		if !isOwner && !isSelfLeave {
			return nil, interfaces.ErrOperationDenied
		}
		if isSelfLeave && ws.Members().IsOnlyOwner(uId) {
			return nil, errOwnerCannotLeaveWorkspace
		}

		err := ws.Members().Leave(uId)
		if err != nil {
			return nil, err
		}
	}

	err = i.repos.Workspace.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) RemoveIntegration(ctx context.Context, wId accountsWorkspace.ID, iId accountsWorkspace.IntegrationID, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	ws, err := i.repos.Workspace.FindByID(ctx, wId)
	if err != nil {
		return nil, err
	}

	err = ws.Members().DeleteIntegration(iId)
	if err != nil {
		return nil, err
	}

	err = i.repos.Workspace.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) RemoveIntegrations(ctx context.Context, wId accountsWorkspace.ID, iIds accountsWorkspace.IntegrationIDList, operator *accountsWorkspace.Operator) (_ *accountsWorkspace.Workspace, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	ws, err := i.repos.Workspace.FindByID(ctx, wId)
	if err != nil {
		return nil, err
	}

	err = ws.Members().DeleteIntegrations(iIds)
	if err != nil {
		return nil, err
	}

	err = i.repos.Workspace.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	applyDefaultPolicyAc(ws, operator)
	return ws, nil
}

func (i *WorkspaceInteractor) Remove(ctx context.Context, id accountsWorkspace.ID, operator *accountsWorkspace.Operator) error {
	if operator == nil || operator.User == nil {
		return errInvalidOperator
	}

	if !operator.IsOwningWorkspace(id) {
		return interfaces.ErrOperationDenied
	}

	ws, err := i.repos.Workspace.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if ws.IsPersonal() {
		return accountsWorkspace.ErrCannotModifyPersonalWorkspace
	}

	return i.repos.Workspace.Remove(ctx, id)
}

func applyDefaultPolicyAc(ws *accountsWorkspace.Workspace, o *accountsWorkspace.Operator) {
	if ws.Policy() == nil && o.DefaultPolicy != nil {
		ws.SetPolicy(o.DefaultPolicy)
	}
}

func filterWorkspacesAc(
	workspaces accountsWorkspace.List,
	operator *accountsWorkspace.Operator,
	err error,
	omitNil, applyDefaultPolicy bool,
) (accountsWorkspace.List, error) {
	if err != nil {
		return nil, err
	}

	if operator == nil {
		if omitNil {
			return nil, nil
		}
		return make([]*accountsWorkspace.Workspace, len(workspaces)), nil
	}

	for j, ws := range workspaces {
		if ws == nil || !operator.IsReadableWorkspace(ws.ID()) {
			workspaces[j] = nil
		}
	}

	if omitNil {
		workspaces = lo.Filter(workspaces, func(t *accountsWorkspace.Workspace, _ int) bool {
			return t != nil
		})
	}

	if applyDefaultPolicy && operator.DefaultPolicy != nil {
		for _, ws := range workspaces {
			if ws == nil {
				continue
			}
			if ws.Policy() == nil {
				ws.SetPolicy(operator.DefaultPolicy)
			}
		}
	}

	return workspaces, nil
}
