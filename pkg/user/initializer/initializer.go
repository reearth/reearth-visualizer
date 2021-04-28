package initializer

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
)

func InitUser(email, username, auth0sub string, userID *id.UserID, teamID *id.TeamID) (*user.User, *user.Team, error) {
	if userID == nil {
		userID = id.NewUserID().Ref()
	}
	if teamID == nil {
		teamID = id.NewTeamID().Ref()
	}

	u, err := user.New().
		ID(*userID).
		Name(username).
		Email(email).
		Auths([]user.Auth{user.AuthFromAuth0Sub(auth0sub)}).
		Build()
	if err != nil {
		return nil, nil, err
	}

	// create a user's own team
	t, err := user.NewTeam().
		ID(*teamID).
		Name(username).
		Members(map[id.UserID]user.Role{u.ID(): user.RoleOwner}).
		Personal(true).
		Build()
	if err != nil {
		return nil, nil, err
	}
	u.UpdateTeam(t.ID())

	return u, t, err
}
