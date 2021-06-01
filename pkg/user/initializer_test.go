package user

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestInit(t *testing.T) {
	uid := id.NewUserID()
	tid := id.NewTeamID()
	testCases := []struct {
		Name, Email, Username, Sub string
		UID                        *id.UserID
		TID                        *id.TeamID
		ExpectedUser               *User
		ExpectedTeam               *Team
		Err                        error
	}{
		{
			Name:     "Success create user",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub:      "###",
			UID:      &uid,
			TID:      &tid,
			ExpectedUser: New().
				ID(uid).
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]Auth{AuthFromAuth0Sub("###")}).
				MustBuild(),
			ExpectedTeam: NewTeam().
				ID(tid).
				Name("nnn").
				Members(map[id.UserID]Role{uid: RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
		{
			Name:     "Success nil team id",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub:      "###",
			UID:      &uid,
			TID:      nil,
			ExpectedUser: New().
				ID(uid).
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]Auth{AuthFromAuth0Sub("###")}).
				MustBuild(),
			ExpectedTeam: NewTeam().
				NewID().
				Name("nnn").
				Members(map[id.UserID]Role{uid: RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
		{
			Name:     "Success nil id",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub:      "###",
			UID:      nil,
			TID:      &tid,
			ExpectedUser: New().
				NewID().
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]Auth{AuthFromAuth0Sub("###")}).
				MustBuild(),
			ExpectedTeam: NewTeam().
				ID(tid).
				Name("nnn").
				Members(map[id.UserID]Role{uid: RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			u, t, err := Init(InitParams{
				Email:    tc.Email,
				Name:     tc.Username,
				Auth0Sub: tc.Sub,
				UserID:   tc.UID,
				TeamID:   tc.TID,
			})
			if err == nil {
				assert.Equal(tt, tc.ExpectedUser.Email(), u.Email())
				assert.Equal(tt, tc.ExpectedUser.Name(), u.Name())
				assert.Equal(tt, tc.ExpectedUser.Auths(), u.Auths())

				assert.Equal(tt, tc.ExpectedTeam.Name(), t.Name())
				assert.Equal(tt, tc.ExpectedTeam.IsPersonal(), t.IsPersonal())
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}
