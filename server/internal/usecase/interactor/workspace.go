package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/usecasex"
)

type Workspace struct {
	common
	workspaceRepo repo.Workspace
	projectRepo   repo.Project
	policyRepo    repo.Policy
	userRepo      repo.User
	transaction   usecasex.Transaction
}

func NewWorkspace(r *repo.Container) *Workspace {
	return &Workspace{
		workspaceRepo: r.Workspace,
		projectRepo:   r.Project,
		policyRepo:    r.Policy,
		userRepo:      r.User,
		transaction:   r.Transaction,
	}
}

func (i *Workspace) Fetch(ctx context.Context, ids []workspace.ID, operator *usecase.Operator) ([]*workspace.Workspace, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.workspaceRepo.FindByIDs(ctx, ids)
	res2, err := i.filterWorkspaces(res, operator, err)
	return res2, err
}

func (i *Workspace) FetchPolicy(ctx context.Context, ids []workspace.PolicyID) ([]*workspace.Policy, error) {
	return i.policyRepo.FindByIDs(ctx, ids)
}

func (i *Workspace) FindByUser(ctx context.Context, id workspace.UserID, operator *usecase.Operator) ([]*workspace.Workspace, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.workspaceRepo.FindByUser(ctx, id)
	res2, err := i.filterWorkspaces(res, operator, err)
	return res2, err
}

func (i *Workspace) Create(ctx context.Context, name string, firstUser workspace.UserID, operator *usecase.Operator) (_ *workspace.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	ws, err := workspace.New().
		NewID().
		Name(name).
		Build()
	if err != nil {
		return nil, err
	}

	if err := ws.Members().Join(firstUser, workspace.RoleOwner); err != nil {
		return nil, err
	}

	if err := i.workspaceRepo.Save(ctx, ws); err != nil {
		return nil, err
	}

	operator.AddNewWorkspace(ws.ID())
	i.applyDefaultPolicy(ws, operator)

	tx.Commit()
	return ws, nil
}

func (i *Workspace) Update(ctx context.Context, id workspace.ID, name string, operator *usecase.Operator) (_ *workspace.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}

	ws, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if ws.IsPersonal() {
		return nil, workspace.ErrCannotModifyPersonalWorkspace
	}
	if ws.Members().GetRole(operator.User) != workspace.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	ws.Rename(name)

	if err := i.workspaceRepo.Save(ctx, ws); err != nil {
		return nil, err
	}

	i.applyDefaultPolicy(ws, operator)

	tx.Commit()
	return ws, nil
}

func (i *Workspace) AddMember(ctx context.Context, id workspace.ID, u workspace.UserID, role workspace.Role, operator *usecase.Operator) (_ *workspace.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil || !operator.IsOwningWorkspace(id) {
		return nil, interfaces.ErrOperationDenied
	}

	_, err = i.userRepo.FindByID(ctx, u)
	if err != nil {
		return nil, err
	}

	ws, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if ws.IsPersonal() {
		return nil, workspace.ErrCannotModifyPersonalWorkspace
	}

	// enforce policy
	if policyID := operator.Policy(ws.Policy()); policyID != nil {
		p, err := i.policyRepo.FindByID(ctx, *policyID)
		if err != nil {
			return nil, err
		}
		if err := p.EnforceMemberCount(ws.Members().Count() + 1); err != nil {
			return nil, err
		}
	}

	if err := ws.Members().Join(u, role); err != nil {
		return nil, err
	}

	if err := i.workspaceRepo.Save(ctx, ws); err != nil {
		return nil, err
	}

	i.applyDefaultPolicy(ws, operator)

	tx.Commit()
	return ws, nil
}

func (i *Workspace) RemoveMember(ctx context.Context, id workspace.ID, u workspace.UserID, operator *usecase.Operator) (_ *workspace.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}

	ws, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if ws.IsPersonal() {
		return nil, workspace.ErrCannotModifyPersonalWorkspace
	}
	if ws.Members().GetRole(operator.User) != workspace.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if u == operator.User {
		return nil, interfaces.ErrOwnerCannotLeaveWorkspace
	}

	err = ws.Members().Leave(u)
	if err != nil {
		return nil, err
	}

	err = i.workspaceRepo.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	i.applyDefaultPolicy(ws, operator)

	tx.Commit()
	return ws, nil
}

func (i *Workspace) UpdateMember(ctx context.Context, id workspace.ID, u workspace.UserID, role workspace.Role, operator *usecase.Operator) (_ *workspace.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}

	ws, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if ws.IsPersonal() {
		return nil, workspace.ErrCannotModifyPersonalWorkspace
	}
	if ws.Members().GetRole(operator.User) != workspace.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if u == operator.User {
		return nil, interfaces.ErrCannotChangeOwnerRole
	}

	err = ws.Members().UpdateRole(u, role)
	if err != nil {
		return nil, err
	}

	err = i.workspaceRepo.Save(ctx, ws)
	if err != nil {
		return nil, err
	}

	i.applyDefaultPolicy(ws, operator)

	tx.Commit()
	return ws, nil
}

func (i *Workspace) Remove(ctx context.Context, id workspace.ID, operator *usecase.Operator) (err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return interfaces.ErrOperationDenied
	}

	ws, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if ws.IsPersonal() {
		return workspace.ErrCannotModifyPersonalWorkspace
	}
	if ws.Members().GetRole(operator.User) != workspace.RoleOwner {
		return interfaces.ErrOperationDenied
	}

	projects, err := i.projectRepo.CountByWorkspace(ctx, id)
	if err != nil {
		return err
	}
	if projects > 0 {
		return interfaces.ErrCannotDeleteWorkspace
	}

	err = i.workspaceRepo.Remove(ctx, id)
	if err != nil {
		return err
	}

	tx.Commit()
	return
}

func (i *Workspace) filterWorkspaces(workspaces []*workspace.Workspace, operator *usecase.Operator, err error) ([]*workspace.Workspace, error) {
	if err != nil {
		return nil, err
	}
	if operator == nil {
		return make([]*workspace.Workspace, len(workspaces)), nil
	}
	for j, t := range workspaces {
		if t == nil || !operator.IsReadableWorkspace(t.ID()) {
			workspaces[j] = nil
		}
		i.applyDefaultPolicy(workspaces[j], operator)
	}
	return workspaces, nil
}

func (i *Workspace) applyDefaultPolicy(ws *workspace.Workspace, o *usecase.Operator) {
	if ws.Policy() == nil && o.DefaultPolicy != nil {
		ws.SetPolicy(o.DefaultPolicy)
	}
}
