package user

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestUser(t *testing.T) {
	uid := id.NewUserID()
	tid := id.NewTeamID()
	testCases := []struct {
		Name     string
		User     *User
		Expected struct {
			Id    id.UserID
			Name  string
			Email string
			Team  id.TeamID
			Auths []Auth
			Lang  language.Tag
		}
	}{
		{
			Name: "create user",
			User: New().ID(uid).
				Team(tid).
				Name("xxx").
				LangFrom("en").
				Email("ff@xx.zz").
				Auths([]Auth{{
					Provider: "aaa",
					Sub:      "sss",
				}}).MustBuild(),
			Expected: struct {
				Id    id.UserID
				Name  string
				Email string
				Team  id.TeamID
				Auths []Auth
				Lang  language.Tag
			}{
				Id:    uid,
				Name:  "xxx",
				Email: "ff@xx.zz",
				Team:  tid,
				Auths: []Auth{{
					Provider: "aaa",
					Sub:      "sss",
				}},
				Lang: language.Make("en"),
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected.Id, tc.User.ID())
			assert.Equal(tt, tc.Expected.Name, tc.User.Name())
			assert.Equal(tt, tc.Expected.Team, tc.User.Team())
			assert.Equal(tt, tc.Expected.Auths, tc.User.Auths())
			assert.Equal(tt, tc.Expected.Email, tc.User.Email())
			assert.Equal(tt, tc.Expected.Lang, tc.User.Lang())
		})
	}
}

func TestUser_AddAuth(t *testing.T) {
	testCases := []struct {
		Name     string
		User     *User
		A        Auth
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name: "add new auth",
			User: New().NewID().MustBuild(),
			A: Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
			Expected: true,
		},
		{
			Name: "existing auth",
			User: New().NewID().Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			A: Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
			Expected: false,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.User.AddAuth(tc.A)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestUser_RemoveAuth(t *testing.T) {
	testCases := []struct {
		Name     string
		User     *User
		A        Auth
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name: "remove auth0",
			User: New().NewID().MustBuild(),
			A: Auth{
				Provider: "auth0",
				Sub:      "zzz",
			},
			Expected: false,
		},
		{
			Name: "existing auth",
			User: New().NewID().Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			A: Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
			Expected: true,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.User.RemoveAuth(tc.A)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestUser_ContainAuth(t *testing.T) {
	testCases := []struct {
		Name     string
		User     *User
		A        Auth
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name: "not existing auth",
			User: New().NewID().MustBuild(),
			A: Auth{
				Provider: "auth0",
				Sub:      "zzz",
			},
			Expected: false,
		},
		{
			Name: "existing auth",
			User: New().NewID().Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			A: Auth{
				Provider: "xxx",
				Sub:      "zzz",
			},
			Expected: true,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.User.ContainAuth(tc.A)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestUser_RemoveAuthByProvider(t *testing.T) {
	testCases := []struct {
		Name     string
		User     *User
		Provider string
		Expected bool
	}{
		{
			Name:     "nil user",
			User:     nil,
			Expected: false,
		},
		{
			Name:     "remove auth0",
			User:     New().NewID().MustBuild(),
			Provider: "auth0",
			Expected: false,
		},
		{
			Name: "existing auth",
			User: New().NewID().Auths([]Auth{{
				Provider: "xxx",
				Sub:      "zzz",
			}}).MustBuild(),
			Provider: "xxx",
			Expected: true,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.User.RemoveAuthByProvider(tc.Provider)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestUser_ClearAuths(t *testing.T) {
	u := New().NewID().Auths([]Auth{{
		Provider: "xxx",
		Sub:      "zzz",
	}}).MustBuild()
	u.ClearAuths()
	assert.Equal(t, 0, len(u.Auths()))
}

func TestUser_Auths(t *testing.T) {
	var u *User
	assert.Equal(t, []Auth(nil), u.Auths())
}

func TestUser_UpdateEmail(t *testing.T) {
	u := New().NewID().MustBuild()
	u.UpdateEmail("ff@xx.zz")
	assert.Equal(t, "ff@xx.zz", u.Email())
}

func TestUser_UpdateLang(t *testing.T) {
	u := New().NewID().MustBuild()
	u.UpdateLang(language.Make("en"))
	assert.Equal(t, language.Make("en"), u.Lang())
}

func TestUser_UpdateTeam(t *testing.T) {
	tid := id.NewTeamID()
	u := New().NewID().MustBuild()
	u.UpdateTeam(tid)
	assert.Equal(t, tid, u.Team())
}

func TestUser_UpdateName(t *testing.T) {
	u := New().NewID().MustBuild()
	u.UpdateName("xxx")
	assert.Equal(t, "xxx", u.Name())
}
