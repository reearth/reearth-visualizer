package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInit(t *testing.T) {
	uid := NewID()
	tid := NewTeamID()
	expectedSub := Auth{
		Provider: "###",
		Sub:      "###",
	}
	tests := []struct {
		Name, Email, Username string
		Sub                   Auth
		UID                   *ID
		TID                   *TeamID
		ExpectedUser          *User
		ExpectedTeam          *Team
		Err                   error
	}{
		{
			Name:     "Success create user",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub: Auth{
				Provider: "###",
				Sub:      "###",
			},
			UID: &uid,
			TID: &tid,
			ExpectedUser: New().
				ID(uid).
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]Auth{expectedSub}).
				MustBuild(),
			ExpectedTeam: NewTeam().
				ID(tid).
				Name("nnn").
				Members(map[ID]Role{uid: RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
		{
			Name:     "Success nil team id",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub: Auth{
				Provider: "###",
				Sub:      "###",
			},
			UID: &uid,
			TID: nil,
			ExpectedUser: New().
				ID(uid).
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]Auth{expectedSub}).
				MustBuild(),
			ExpectedTeam: NewTeam().
				NewID().
				Name("nnn").
				Members(map[ID]Role{uid: RoleOwner}).
				Personal(true).
				MustBuild(),
			Err: nil,
		},
		{
			Name:     "Success nil id",
			Email:    "xx@yy.zz",
			Username: "nnn",
			Sub: Auth{
				Provider: "###",
				Sub:      "###",
			},
			UID: nil,
			TID: &tid,
			ExpectedUser: New().
				NewID().
				Email("xx@yy.zz").
				Name("nnn").
				Team(tid).
				Auths([]Auth{expectedSub}).
				MustBuild(),
			ExpectedTeam: NewTeam().
				ID(tid).
				Name("nnn").
				Members(map[ID]Role{uid: RoleOwner}).
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
