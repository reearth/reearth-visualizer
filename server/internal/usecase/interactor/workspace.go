package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/workspace"
)

type Workspace struct {
	common
	teamRepo    repo.Workspace
	projectRepo repo.Project
	userRepo    repo.User
	transaction repo.Transaction
}

func NewWorkspace(r *repo.Container) interfaces.Workspace {
	return &Workspace{
		teamRepo:    r.Team,
		projectRepo: r.Project,
		userRepo:    r.User,
		transaction: r.Transaction,
	}
}

func (i *Workspace) Fetch(ctx context.Context, ids []workspace.ID, operator *usecase.Operator) ([]*workspace.Workspace, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.teamRepo.FindByIDs(ctx, ids)
	res2, err := i.filterTeams(res, operator, err)
	return res2, err
}

func (i *Workspace) FindByUser(ctx context.Context, id workspace.UserID, operator *usecase.Operator) ([]*workspace.Workspace, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.teamRepo.FindByUser(ctx, id)
	res2, err := i.filterTeams(res, operator, err)
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

	team, err := workspace.New().
		NewID().
		Name(name).
		Build()
	if err != nil {
		return nil, err
	}

	if err := team.Members().Join(firstUser, workspace.RoleOwner); err != nil {
		return nil, err
	}

	if err := i.teamRepo.Save(ctx, team); err != nil {
		return nil, err
	}

	operator.AddNewTeam(team.ID())
	tx.Commit()
	return team, nil
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

	team, err := i.teamRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if team.IsPersonal() {
		return nil, workspace.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != workspace.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	team.Rename(name)

	err = i.teamRepo.Save(ctx, team)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return team, nil
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

	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}

	team, err := i.teamRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if team.IsPersonal() {
		return nil, workspace.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != workspace.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	_, err = i.userRepo.FindByID(ctx, u)
	if err != nil {
		return nil, err
	}

	err = team.Members().Join(u, role)
	if err != nil {
		return nil, err
	}

	err = i.teamRepo.Save(ctx, team)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return team, nil
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

	team, err := i.teamRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if team.IsPersonal() {
		return nil, workspace.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != workspace.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if u == operator.User {
		return nil, interfaces.ErrOwnerCannotLeaveWorkspace
	}

	err = team.Members().Leave(u)
	if err != nil {
		return nil, err
	}

	err = i.teamRepo.Save(ctx, team)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return team, nil
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

	team, err := i.teamRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if team.IsPersonal() {
		return nil, workspace.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != workspace.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if u == operator.User {
		return nil, interfaces.ErrCannotChangeOwnerRole
	}

	err = team.Members().UpdateRole(u, role)
	if err != nil {
		return nil, err
	}

	err = i.teamRepo.Save(ctx, team)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return team, nil
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

	team, err := i.teamRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if team.IsPersonal() {
		return workspace.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != workspace.RoleOwner {
		return interfaces.ErrOperationDenied
	}

	projects, err := i.projectRepo.CountByTeam(ctx, id)
	if err != nil {
		return err
	}
	if projects > 0 {
		return interfaces.ErrCannotDeleteWorkspace
	}

	err = i.teamRepo.Remove(ctx, id)
	if err != nil {
		return err
	}

	tx.Commit()
	return
}

func (i *Workspace) filterTeams(teams []*workspace.Workspace, operator *usecase.Operator, err error) ([]*workspace.Workspace, error) {
	if err != nil {
		return nil, err
	}
	if operator == nil {
		return make([]*workspace.Workspace, len(teams)), nil
	}
	for i, t := range teams {
		if t == nil || !operator.IsReadableTeam(t.ID()) {
			teams[i] = nil
		}
	}
	return teams, nil
}
