package interactor

import (
	"context"
	"errors"
	"net/http"
	"net/url"
	"testing"
	"time"

	"github.com/jarcoal/httpmock"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/mailer"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestUser_Signup(t *testing.T) {
	user.DefaultPasswordEncoder = &user.NoopPasswordEncoder{}
	uid := id.NewUserID()
	wid := id.NewWorkspaceID()
	mocktime := time.Time{}
	mockcode := "CODECODE"

	defer user.MockNow(mocktime)()
	defer user.MockGenerateVerificationCode(mockcode)()

	tests := []struct {
		name             string
		signupSecret     string
		authSrvUIDomain  string
		createUserBefore *user.User
		args             interfaces.SignupParam
		wantUser         *user.User
		wantWorkspace    *workspace.Workspace
		wantMailTo       []mailer.Contact
		wantMailSubject  string
		wantMailContent  string
		wantError        error
	}{
		{
			name:            "without secret",
			signupSecret:    "",
			authSrvUIDomain: "https://reearth.io",
			args: interfaces.SignupParam{
				Sub:      lo.ToPtr("SUB"),
				Email:    "aaa@bbb.com",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00!!"),
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &wid,
				},
			},
			wantUser: user.New().
				ID(uid).
				Workspace(wid).
				Name("NAME").
				Auths([]user.Auth{{Sub: "SUB"}}).
				Email("aaa@bbb.com").
				PasswordPlainText("PAss00!!").
				Verification(user.VerificationFrom(mockcode, mocktime.Add(24*time.Hour), false)).
				MustBuild(),
			wantWorkspace: workspace.New().
				ID(wid).
				Name("NAME").
				Members(map[id.UserID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			wantMailTo:      []mailer.Contact{{Email: "aaa@bbb.com", Name: "NAME"}},
			wantMailSubject: "email verification",
			wantMailContent: "https://reearth.io/?user-verification-token=CODECODE",
			wantError:       nil,
		},
		{
			name:            "existing but not valdiated user",
			signupSecret:    "",
			authSrvUIDomain: "",
			createUserBefore: user.New().
				ID(uid).
				Workspace(wid).
				Email("aaa@bbb.com").
				MustBuild(),
			args: interfaces.SignupParam{
				Email:    "aaa@bbb.com",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00!!"),
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &wid,
				},
			},
			wantUser: user.New().
				ID(uid).
				Workspace(wid).
				Email("aaa@bbb.com").
				Verification(user.VerificationFrom(mockcode, mocktime.Add(24*time.Hour), false)).
				MustBuild(),
			wantWorkspace:   nil,
			wantMailTo:      []mailer.Contact{{Email: "aaa@bbb.com", Name: ""}},
			wantMailSubject: "email verification",
			wantMailContent: "/?user-verification-token=CODECODE",
			wantError:       nil,
		},
		{
			name:            "existing and valdiated user",
			signupSecret:    "",
			authSrvUIDomain: "",
			createUserBefore: user.New().
				ID(uid).
				Workspace(wid).
				Email("aaa@bbb.com").
				Verification(user.VerificationFrom(mockcode, mocktime, true)).
				MustBuild(),
			args: interfaces.SignupParam{
				Sub:      lo.ToPtr("SUB"),
				Email:    "aaa@bbb.com",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00!!"),
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &wid,
				},
			},
			wantUser:      nil,
			wantWorkspace: nil,
			wantError:     interfaces.ErrUserAlreadyExists,
		},
		{
			name:            "without secret 2",
			signupSecret:    "",
			authSrvUIDomain: "",
			args: interfaces.SignupParam{
				Sub:      lo.ToPtr("SUB"),
				Email:    "aaa@bbb.com",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00!!"),
				Secret:   lo.ToPtr("hogehoge"),
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &wid,
				},
			},
			wantUser: user.New().
				ID(uid).
				Workspace(wid).
				Name("NAME").
				Auths([]user.Auth{{Provider: "", Sub: "SUB"}}).
				Email("aaa@bbb.com").
				PasswordPlainText("PAss00!!").
				Verification(user.VerificationFrom(mockcode, mocktime.Add(24*time.Hour), false)).
				MustBuild(),
			wantWorkspace: workspace.New().
				ID(wid).
				Name("NAME").
				Members(map[id.UserID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			wantMailTo:      []mailer.Contact{{Email: "aaa@bbb.com", Name: "NAME"}},
			wantMailSubject: "email verification",
			wantMailContent: "/?user-verification-token=CODECODE",
			wantError:       nil,
		},
		{
			name:            "with secret",
			signupSecret:    "SECRET",
			authSrvUIDomain: "",
			args: interfaces.SignupParam{
				Sub:      lo.ToPtr("SUB"),
				Email:    "aaa@bbb.com",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00!!"),
				Secret:   lo.ToPtr("SECRET"),
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &wid,
					Lang:        &language.Japanese,
					Theme:       user.ThemeDark.Ref(),
				},
			},
			wantUser: user.New().
				ID(uid).
				Workspace(wid).
				Name("NAME").
				Auths([]user.Auth{{Provider: "", Sub: "SUB"}}).
				Email("aaa@bbb.com").
				PasswordPlainText("PAss00!!").
				Lang(language.Japanese).
				Theme(user.ThemeDark).
				Verification(user.VerificationFrom(mockcode, mocktime.Add(24*time.Hour), false)).
				MustBuild(),
			wantWorkspace: workspace.New().
				ID(wid).
				Name("NAME").
				Members(map[id.UserID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			wantMailTo:      []mailer.Contact{{Email: "aaa@bbb.com", Name: "NAME"}},
			wantMailSubject: "email verification",
			wantMailContent: "/?user-verification-token=CODECODE",
			wantError:       nil,
		},
		{
			name:            "invalid secret",
			signupSecret:    "SECRET",
			authSrvUIDomain: "",
			args: interfaces.SignupParam{
				Sub:      lo.ToPtr("SUB"),
				Email:    "aaa@bbb.com",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00!!"),
				Secret:   lo.ToPtr("SECRET!"),
			},
			wantError: interfaces.ErrSignupInvalidSecret,
		},
		{
			name:            "invalid secret 2",
			signupSecret:    "SECRET",
			authSrvUIDomain: "",
			args: interfaces.SignupParam{
				Sub:      lo.ToPtr("SUB"),
				Email:    "aaa@bbb.com",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00!!"),
			},
			wantError: interfaces.ErrSignupInvalidSecret,
		},
		{
			name: "invalid email",
			args: interfaces.SignupParam{
				Email:    "aaa",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00!!"),
			},
			wantError: user.ErrInvalidEmail,
		},
		{
			name: "invalid password",
			args: interfaces.SignupParam{
				Email:    "aaa@bbb.com",
				Name:     "NAME",
				Password: lo.ToPtr("PAss00"),
			},
			wantError: user.ErrPasswordLength,
		},
		{
			name: "invalid name",
			args: interfaces.SignupParam{
				Email:    "aaa@bbb.com",
				Name:     "",
				Password: lo.ToPtr("PAss00!!"),
			},
			wantError: interfaces.ErrSignupInvalidName,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// t.Parallel() cannot be used
			r := memory.New()
			if tt.createUserBefore != nil {
				assert.NoError(t, r.User.Save(
					context.Background(),
					tt.createUserBefore),
				)
			}
			m := mailer.NewMock()
			g := &gateway.Container{Mailer: m}
			uc := NewUser(r, g, tt.signupSecret, tt.authSrvUIDomain)

			user, ws, err := uc.Signup(context.Background(), tt.args)
			assert.Equal(t, tt.wantUser, user)
			assert.Equal(t, tt.wantWorkspace, ws)
			assert.Equal(t, tt.wantError, err)

			mails := m.Mails()
			if tt.wantMailSubject == "" {
				assert.Empty(t, mails)
			} else {
				assert.Equal(t, 1, len(mails))
				assert.Equal(t, tt.wantMailSubject, mails[0].Subject)
				assert.Equal(t, tt.wantMailTo, mails[0].To)
				assert.Contains(t, mails[0].PlainContent, tt.wantMailContent)
			}
		})
	}
}

func TestUser_SignupOIDC(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder(
		"GET",
		"https://issuer/.well-known/openid-configuration",
		httpmock.NewStringResponder(200, `{"userinfo_endpoint":"https://issuer/userinfo"}`),
	)

	httpmock.RegisterResponder(
		"GET",
		"https://issuer/userinfo",
		func(req *http.Request) (*http.Response, error) {
			if req.Header.Get("Authorization") == "Bearer accesstoken" {
				return httpmock.NewStringResponse(200, `{"sub":"SUB","email":"x@y.z","name":"NAME"}`), nil
			}
			return httpmock.NewStringResponse(401, "Unauthorized"), nil
		},
	)

	user.DefaultPasswordEncoder = &user.NoopPasswordEncoder{}
	uid := id.NewUserID()
	tid := id.NewWorkspaceID()
	mocktime := time.Time{}
	mockcode := "CODECODE"

	defer user.MockNow(mocktime)()
	defer user.MockGenerateVerificationCode(mockcode)()

	tests := []struct {
		name             string
		signupSecret     string
		authSrvUIDomain  string
		createUserBefore *user.User
		args             interfaces.SignupOIDCParam
		wantUser         *user.User
		wantWorkspace    *workspace.Workspace
		wantMail         *mailer.Mail
		wantMailTo       string
		wantMailSubject  string
		wantMailContent  string
		wantError        error
	}{
		{
			name:            "userinfo",
			signupSecret:    "",
			authSrvUIDomain: "",
			args: interfaces.SignupOIDCParam{
				AccessToken: "accesstoken",
				Issuer:      "https://issuer",
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &tid,
				},
			},
			wantUser: user.New().
				ID(uid).
				Workspace(tid).
				Name("NAME").
				Auths([]user.Auth{{Provider: "", Sub: "SUB"}}).
				Email("x@y.z").
				MustBuild(),
			wantWorkspace: workspace.New().
				ID(tid).
				Name("NAME").
				Members(map[id.UserID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			wantError: nil,
		},
		{
			name:            "no userinfo",
			signupSecret:    "",
			authSrvUIDomain: "",
			args: interfaces.SignupOIDCParam{
				Email:       "aaa@bbb.com",
				Name:        "name",
				AccessToken: "accesstoken",
				Issuer:      "https://issuer",
				Sub:         "sub",
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &tid,
				},
			},
			wantUser: user.New().
				ID(uid).
				Workspace(tid).
				Name("name").
				Auths([]user.Auth{{Provider: "", Sub: "sub"}}).
				Email("aaa@bbb.com").
				MustBuild(),
			wantWorkspace: workspace.New().
				ID(tid).
				Name("name").
				Members(map[id.UserID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			wantError: nil,
		},
		{
			name:            "no userinfo with secret",
			signupSecret:    "SECRET",
			authSrvUIDomain: "",
			args: interfaces.SignupOIDCParam{
				Email:       "aaa@bbb.com",
				Name:        "name",
				AccessToken: "accesstoken",
				Issuer:      "https://issuer",
				Sub:         "sub",
				Secret:      lo.ToPtr("SECRET"),
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &tid,
				},
			},
			wantUser: user.New().
				ID(uid).
				Workspace(tid).
				Name("name").
				Auths([]user.Auth{{Provider: "", Sub: "sub"}}).
				Email("aaa@bbb.com").
				MustBuild(),
			wantWorkspace: workspace.New().
				ID(tid).
				Name("name").
				Members(map[id.UserID]workspace.Role{uid: workspace.RoleOwner}).
				Personal(true).
				MustBuild(),
			wantError: nil,
		},
		{
			name:            "existed but not validated user",
			signupSecret:    "",
			authSrvUIDomain: "",
			createUserBefore: user.New().
				ID(uid).
				Email("aaa@bbb.com").
				Workspace(user.NewWorkspaceID()).
				MustBuild(),
			args: interfaces.SignupOIDCParam{
				AccessToken: "accesstoken",
				Issuer:      "https://issuer",
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &tid,
				},
			},
			wantError: interfaces.ErrUserAlreadyExists,
		},
		{
			name:            "existed and verified user",
			signupSecret:    "",
			authSrvUIDomain: "",
			createUserBefore: user.New().
				ID(uid).
				Email("aaa@bbb.com").
				Workspace(user.NewWorkspaceID()).
				Verification(user.VerificationFrom(mockcode, mocktime, true)).
				MustBuild(),
			args: interfaces.SignupOIDCParam{
				AccessToken: "accesstoken",
				Issuer:      "https://issuer",
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &tid,
				},
			},
			wantError: interfaces.ErrUserAlreadyExists,
		},
		{
			name:            "invalid secret",
			signupSecret:    "SECRET",
			authSrvUIDomain: "",
			args: interfaces.SignupOIDCParam{
				Email:       "aaa@bbb.com",
				Name:        "name",
				AccessToken: "accesstoken",
				Issuer:      "https://issuer",
				Sub:         "sub",
				Secret:      lo.ToPtr("SECRET!"),
				User: interfaces.SignupUserParam{
					UserID:      &uid,
					WorkspaceID: &tid,
				},
			},
			wantError: interfaces.ErrSignupInvalidSecret,
		},
		{
			name: "invalid email",
			args: interfaces.SignupOIDCParam{
				Email:       "aaabbbcom",
				Name:        "name",
				AccessToken: "accesstoken",
				Issuer:      "https://issuer",
				Sub:         "sub",
			},
			wantError: user.ErrInvalidEmail,
		},
		{
			name: "invalid access token",
			args: interfaces.SignupOIDCParam{
				Email:       "",
				Name:        "",
				AccessToken: "",
				Issuer:      "https://issuer",
				Sub:         "sub",
			},
			wantError: errors.New("invalid access token"),
		},
		{
			name: "invalid issuer",
			args: interfaces.SignupOIDCParam{
				Email:       "",
				Name:        "",
				AccessToken: "access token",
				Issuer:      "",
				Sub:         "sub",
			},
			wantError: errors.New("invalid issuer"),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// t.Parallel() cannot be used
			r := memory.New()
			if tt.createUserBefore != nil {
				assert.NoError(t, r.User.Save(
					context.Background(),
					tt.createUserBefore),
				)
			}
			m := mailer.NewMock()
			g := &gateway.Container{Mailer: m}
			uc := NewUser(r, g, tt.signupSecret, tt.authSrvUIDomain)
			user, ws, err := uc.SignupOIDC(context.Background(), tt.args)
			assert.Equal(t, tt.wantUser, user)
			assert.Equal(t, tt.wantWorkspace, ws)
			assert.Equal(t, tt.wantError, err)
			assert.Empty(t, m.Mails())
		})
	}
}

func TestIssToURL(t *testing.T) {
	assert.Nil(t, issToURL("", ""))
	assert.Equal(t, &url.URL{Scheme: "https", Host: "iss.com"}, issToURL("iss.com", ""))
	assert.Equal(t, &url.URL{Scheme: "https", Host: "iss.com"}, issToURL("https://iss.com", ""))
	assert.Equal(t, &url.URL{Scheme: "http", Host: "iss.com"}, issToURL("http://iss.com", ""))
	assert.Equal(t, &url.URL{Scheme: "https", Host: "iss.com", Path: ""}, issToURL("https://iss.com/", ""))
	assert.Equal(t, &url.URL{Scheme: "https", Host: "iss.com", Path: "/hoge"}, issToURL("https://iss.com/hoge", ""))
	assert.Equal(t, &url.URL{Scheme: "https", Host: "iss.com", Path: "/hoge/foobar"}, issToURL("https://iss.com/hoge", "foobar"))
}
