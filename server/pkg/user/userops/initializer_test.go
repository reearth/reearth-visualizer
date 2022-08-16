package userops

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/stretchr/testify/assert"
)

func TestInit(t *testing.T) {
	uid := user.NewID()
	tid := workspace.NewID()
	expectedSub := user.Auth{
		Provider: "###",
		Sub:      "###",
	}
	tests := []struct {
		Name, Email, Username string
		Sub                   user.Auth
		UID                   *user.ID
		TID                   *workspace.ID
		ExpectedUser          *user.User
		ExpectedTeam          *workspace.Workspace
		Err                   error
	}{
		{
			Name:     "Success create user",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub: user.Auth{
				Provider: "###",
				Sub:      "###",
			},
			UID: &uid,
			TID: &tid,
			ExpectedUser: user.New().
				ID(uid).
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]user.Auth{expectedSub}).
				MustBuild(),
			ExpectedTeam: workspace.New().
				ID(tid).
				Name("nnn").
				Members(map[user.ID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
		{
			Name:     "Success nil team id",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub: user.Auth{
				Provider: "###",
				Sub:      "###",
			},
			UID: &uid,
			TID: nil,
			ExpectedUser: user.New().
				ID(uid).
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]user.Auth{expectedSub}).
				MustBuild(),
			ExpectedTeam: workspace.New().
				NewID().
				Name("nnn").
				Members(map[user.ID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
		{
			Name:     "Success nil id",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub: user.Auth{
				Provider: "###",
				Sub:      "###",
			},
			UID: nil,
			TID: &tid,
			ExpectedUser: user.New().
				NewID().
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]user.Auth{expectedSub}).
				MustBuild(),
			ExpectedTeam: workspace.New().
				ID(tid).
				Name("nnn").
				Members(map[user.ID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			user, team, err := Init(InitParams{
				Email:  tt.Email,
				Name:   tt.Username,
				Sub:    &tt.Sub,
				UserID: tt.UID,
				TeamID: tt.TID,
			})
			if tt.Err == nil {
				assert.Equal(t, tt.ExpectedUser.Email(), user.Email())
				assert.Equal(t, tt.ExpectedUser.Name(), user.Name())
				assert.Equal(t, tt.ExpectedUser.Auths(), user.Auths())

				assert.Equal(t, tt.ExpectedTeam.Name(), team.Name())
				assert.Equal(t, tt.ExpectedTeam.IsPersonal(), team.IsPersonal())
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}
