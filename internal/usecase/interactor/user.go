package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/project"
	"github.com/reearth/reearth-backend/pkg/user"
)

type User struct {
	common
	userRepo          repo.User
	teamRepo          repo.Team
	projectRepo       repo.Project
	sceneRepo         repo.Scene
	sceneLockRepo     repo.SceneLock
	layerRepo         repo.Layer
	propertyRepo      repo.Property
	datasetRepo       repo.Dataset
	datasetSchemaRepo repo.DatasetSchema
	transaction       repo.Transaction
	file              gateway.File
	authenticator     gateway.Authenticator
	signupSecret      string
}

func NewUser(r *repo.Container, g *gateway.Container, signupSecret string) interfaces.User {
	return &User{
		userRepo:          r.User,
		teamRepo:          r.Team,
		projectRepo:       r.Project,
		sceneRepo:         r.Scene,
		sceneLockRepo:     r.SceneLock,
		layerRepo:         r.Layer,
		propertyRepo:      r.Property,
		datasetRepo:       r.Dataset,
		datasetSchemaRepo: r.DatasetSchema,
		transaction:       r.Transaction,
		file:              g.File,
		authenticator:     g.Authenticator,
		signupSecret:      signupSecret,
	}
}

func (i *User) Fetch(ctx context.Context, ids []id.UserID, operator *usecase.Operator) ([]*user.User, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.userRepo.FindByIDs(ctx, ids)
	if err != nil {
		return res, err
	}
	// filter
	for k, u := range res {
		teams, err := i.teamRepo.FindByUser(ctx, u.ID())
		if err != nil {
			return res, err
		}
		teamIDs := make([]id.TeamID, 0, len(teams))
		for _, t := range teams {
			if t != nil {
				teamIDs = append(teamIDs, t.ID())
			}
		}
		if !operator.IsReadableTeamsIncluded(teamIDs) {
			res[k] = nil
		}
	}
	return res, nil
}

func (i *User) Signup(ctx context.Context, inp interfaces.SignupParam) (u *user.User, _ *user.Team, err error) {
	if i.signupSecret != "" && inp.Secret != i.signupSecret {
		return nil, nil, interfaces.ErrSignupInvalidSecret
	}

	if len(inp.Sub) == 0 {
		return nil, nil, errors.New("sub is required")
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		err = tx.End(ctx)
	}()

	// Check if user and team already exists
	existed, err := i.userRepo.FindByAuth0Sub(ctx, inp.Sub)
	if err != nil && !errors.Is(err, err1.ErrNotFound) {
		return nil, nil, err
	}
	if existed != nil {
		return nil, nil, errors.New("existed user")
	}

	if inp.UserID != nil {
		existed, err := i.userRepo.FindByID(ctx, *inp.UserID)
		if err != nil && !errors.Is(err, err1.ErrNotFound) {
			return nil, nil, err
		}
		if existed != nil {
			return nil, nil, errors.New("existed user")
		}
	}

	if inp.TeamID != nil {
		existed, err := i.teamRepo.FindByID(ctx, *inp.TeamID)
		if err != nil && !errors.Is(err, err1.ErrNotFound) {
			return nil, nil, err
		}
		if existed != nil {
			return nil, nil, errors.New("existed team")
		}
	}

	// Fetch user info
	ui, err := i.authenticator.FetchUser(inp.Sub)
	if err != nil {
		return nil, nil, err
	}

	// Check if user and team already exists
	var team *user.Team
	existed, err = i.userRepo.FindByEmail(ctx, ui.Email)
	if err != nil && !errors.Is(err, err1.ErrNotFound) {
		return nil, nil, err
	}
	if existed != nil {
		return nil, nil, errors.New("existed user")
	}

	// Initialize user and team
	u, team, err = user.Init(user.InitParams{
		Email:    ui.Email,
		Name:     ui.Name,
		Auth0Sub: inp.Sub,
		Lang:     inp.Lang,
		Theme:    inp.Theme,
		UserID:   inp.UserID,
		TeamID:   inp.TeamID,
	})
	if err != nil {
		return nil, nil, err
	}
	if err := i.userRepo.Save(ctx, u); err != nil {
		return nil, nil, err
	}
	if err := i.teamRepo.Save(ctx, team); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return u, team, nil
}

func (i *User) UpdateMe(ctx context.Context, p interfaces.UpdateMeParam, operator *usecase.Operator) (u *user.User, err error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}

	if p.Password != nil {
		if p.PasswordConfirmation == nil || *p.Password != *p.PasswordConfirmation {
			return nil, interfaces.ErrUserInvalidPasswordConfirmation
		}
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		err = tx.End(ctx)
	}()

	var team *user.Team

	u, err = i.userRepo.FindByID(ctx, operator.User)
	if err != nil {
		return nil, err
	}

	if p.Name != nil {
		oldName := u.Name()
		u.UpdateName(*p.Name)

		team, err = i.teamRepo.FindByID(ctx, u.Team())
		if err != nil && !errors.Is(err, err1.ErrNotFound) {
			return nil, err
		}

		tn := team.Name()
		if tn == "" || tn == oldName {
			team.Rename(*p.Name)
		} else {
			team = nil
		}
	}
	if p.Email != nil {
		u.UpdateEmail(*p.Email)
	}
	if p.Lang != nil {
		u.UpdateLang(*p.Lang)
	}
	if p.Theme != nil {
		u.UpdateTheme(*p.Theme)
	}

	// Update Auth0 users
	if p.Name != nil || p.Email != nil || p.Password != nil {
		for _, a := range u.Auths() {
			if _, err := i.authenticator.UpdateUser(gateway.AuthenticatorUpdateUserParam{
				ID:       a.Sub,
				Name:     p.Name,
				Email:    p.Email,
				Password: p.Password,
			}); err != nil {
				return nil, err
			}
		}
	}

	if team != nil {
		err = i.teamRepo.Save(ctx, team)
		if err != nil {
			return nil, err
		}
	}

	err = i.userRepo.Save(ctx, u)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return u, nil
}

func (i *User) RemoveMyAuth(ctx context.Context, authProvider string, operator *usecase.Operator) (u *user.User, err error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		err = tx.End(ctx)
	}()

	u, err = i.userRepo.FindByID(ctx, operator.User)
	if err != nil {
		return nil, err
	}

	u.RemoveAuthByProvider(authProvider)

	err = i.userRepo.Save(ctx, u)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return u, nil
}

func (i *User) SearchUser(ctx context.Context, nameOrEmail string, operator *usecase.Operator) (u *user.User, err error) {
	u, err = i.userRepo.FindByNameOrEmail(ctx, nameOrEmail)
	if err != nil && !errors.Is(err, err1.ErrNotFound) {
		return nil, err
	}
	return u, nil
}

func (i *User) DeleteMe(ctx context.Context, userID id.UserID, operator *usecase.Operator) (err error) {
	if operator == nil || operator.User.IsNil() || userID.IsNil() || userID != operator.User {
		return errors.New("invalid user id")
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		err = tx.End(ctx)
	}()

	u, err := i.userRepo.FindByID(ctx, userID)
	if err != nil && !errors.Is(err, err1.ErrNotFound) {
		return err
	}
	if u == nil {
		return nil
	}

	teams, err := i.teamRepo.FindByUser(ctx, u.ID())
	if err != nil {
		return err
	}

	deleter := ProjectDeleter{
		SceneDeleter: SceneDeleter{
			Scene:         i.sceneRepo,
			SceneLock:     i.sceneLockRepo,
			Layer:         i.layerRepo,
			Property:      i.propertyRepo,
			Dataset:       i.datasetRepo,
			DatasetSchema: i.datasetSchemaRepo,
		},
		File:    i.file,
		Project: i.projectRepo,
	}
	updatedTeams := make([]*user.Team, 0, len(teams))
	deletedTeams := []id.TeamID{}

	for _, team := range teams {
		if !team.IsPersonal() && !team.Members().IsOnlyOwner(u.ID()) {
			_ = team.Members().Leave(u.ID())
			updatedTeams = append(updatedTeams, team)
			continue
		}

		// Delete all projects
		err := repo.IterateProjectsByTeam(i.projectRepo, ctx, team.ID(), 50, func(projects []*project.Project) error {
			for _, prj := range projects {
				if err := deleter.Delete(ctx, prj, true, operator); err != nil {
					return err
				}
			}
			return nil
		})
		if err != nil {
			return err
		}

		deletedTeams = append(deletedTeams, team.ID())
	}

	// Save teams
	if err := i.teamRepo.SaveAll(ctx, updatedTeams); err != nil {
		return err
	}

	// Delete teams
	if err := i.teamRepo.RemoveAll(ctx, deletedTeams); err != nil {
		return err
	}

	// Delete user
	if err := i.userRepo.Remove(ctx, u.ID()); err != nil {
		return err
	}

	tx.Commit()
	return nil
}
