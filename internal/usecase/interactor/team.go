package interactor

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
)

type Team struct {
	common
	teamRepo    repo.Team
	projectRepo repo.Project
	userRepo    repo.User
	transaction repo.Transaction
}

func NewTeam(r *repo.Container) interfaces.Team {
	return &Team{
		teamRepo:    r.Team,
		projectRepo: r.Project,
		userRepo:    r.User,
		transaction: r.Transaction,
	}
}

func (i *Team) Fetch(ctx context.Context, ids []id.TeamID, operator *usecase.Operator) ([]*user.Team, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.teamRepo.FindByIDs(ctx, ids)
	res2, err := i.filterTeams(res, operator, err)
	return res2, err
}

func (i *Team) FindByUser(ctx context.Context, id id.UserID, operator *usecase.Operator) ([]*user.Team, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.teamRepo.FindByUser(ctx, id)
	res2, err := i.filterTeams(res, operator, err)
	return res2, err
}

func (i *Team) Create(ctx context.Context, name string, firstUser id.UserID, operator *usecase.Operator) (_ *user.Team, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	team, err := user.NewTeam().
		NewID().
		Name(name).
		Build()
	if err != nil {
		return nil, err
	}

	if err := team.Members().Join(firstUser, user.RoleOwner); err != nil {
		return nil, err
	}

	if err := i.teamRepo.Save(ctx, team); err != nil {
		return nil, err
	}

	operator.AddNewTeam(team.ID())
	tx.Commit()
	return team, nil
}

func (i *Team) Update(ctx context.Context, id id.TeamID, name string, operator *usecase.Operator) (_ *user.Team, err error) {
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
		return nil, user.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != user.RoleOwner {
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

func (i *Team) AddMember(ctx context.Context, id id.TeamID, u id.UserID, role user.Role, operator *usecase.Operator) (_ *user.Team, err error) {
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
		return nil, user.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != user.RoleOwner {
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

func (i *Team) RemoveMember(ctx context.Context, id id.TeamID, u id.UserID, operator *usecase.Operator) (_ *user.Team, err error) {
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
		return nil, user.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != user.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if u.ID() == operator.User.ID() {
		return nil, interfaces.ErrOwnerCannotLeaveTheTeam
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

func (i *Team) UpdateMember(ctx context.Context, id id.TeamID, u id.UserID, role user.Role, operator *usecase.Operator) (_ *user.Team, err error) {
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
		return nil, user.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != user.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if u.ID() == operator.User.ID() {
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

func (i *Team) Remove(ctx context.Context, id id.TeamID, operator *usecase.Operator) (err error) {
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
		return user.ErrCannotModifyPersonalTeam
	}
	if team.Members().GetRole(operator.User) != user.RoleOwner {
		return interfaces.ErrOperationDenied
	}

	projects, err := i.projectRepo.CountByTeam(ctx, id)
	if err != nil {
		return err
	}
	if projects > 0 {
		return interfaces.ErrCannotDeleteTeam
	}

	err = i.teamRepo.Remove(ctx, id)
	if err != nil {
		return err
	}

	tx.Commit()
	return
}

func (i *Team) filterTeams(teams []*user.Team, operator *usecase.Operator, err error) ([]*user.Team, error) {
	if err != nil {
		return nil, err
	}
	if operator == nil {
		return make([]*user.Team, len(teams)), nil
	}
	for i, t := range teams {
		if t == nil || !operator.IsReadableTeam(t.ID()) {
			teams[i] = nil
		}
	}
	return teams, nil
}
