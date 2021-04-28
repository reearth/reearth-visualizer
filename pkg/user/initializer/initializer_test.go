package initializer

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestInitUser(t *testing.T) {
	uid := id.NewUserID()
	tid := id.NewTeamID()
	testCases := []struct {
		Name, Email, Username, Sub string
		UID                        *id.UserID
		TID                        *id.TeamID
		ExpectedUser               *user.User
		ExpectedTeam               *user.Team
		Err                        error
	}{
		{
			Name:     "Success create user",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub:      "###",
			UID:      &uid,
			TID:      &tid,
			ExpectedUser: user.New().
				ID(uid).
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]user.Auth{user.AuthFromAuth0Sub("###")}).
				MustBuild(),
			ExpectedTeam: user.NewTeam().
				ID(tid).
				Name("nnn").
				Members(map[id.UserID]user.
					Role{uid: user.RoleOwner}).
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
			ExpectedUser: user.New().
				ID(uid).
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]user.Auth{user.AuthFromAuth0Sub("###")}).
				MustBuild(),
			ExpectedTeam: user.NewTeam().
				NewID().
				Name("nnn").
				Members(map[id.UserID]user.
					Role{uid: user.RoleOwner}).
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
			ExpectedUser: user.New().
				NewID().
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]user.Auth{user.AuthFromAuth0Sub("###")}).
				MustBuild(),
			ExpectedTeam: user.NewTeam().
				ID(tid).
				Name("nnn").
				Members(map[id.UserID]user.
					Role{uid: user.RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			u, t, err := InitUser(tc.Email, tc.Username, tc.Sub, tc.UID, tc.TID)
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
