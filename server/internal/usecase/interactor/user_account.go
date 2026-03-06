package interactor

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	htmlTmpl "html/template"
	"net/http"
	"net/url"
	"path"
	"strings"
	textTmpl "text/template"

	accountsGateway "github.com/reearth/reearth-accounts/server/pkg/gateway"
	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/mailer"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	errUserInvalidPasswordConfirmation = errors.New("invalid password confirmation")
	errUserInvalidPasswordReset        = errors.New("invalid password reset request")
	errSignupInvalidSecret             = errors.New("invalid secret")
	errUserAlreadyExists               = errors.New("user already exists")

	userAuthTextTMPLStr = `Hi {{.UserName}},

{{.Message}}

{{.ActionLabel}}: {{.ActionURL}}

{{.Suffix}}`

	userAuthHTMLTMPLStr = `<html><body>
<p>Hi {{.UserName}},</p>
<p>{{.Message}}</p>
<p><a href="{{.ActionURL}}">{{.ActionLabel}}</a></p>
<p>{{.Suffix}}</p>
</body></html>`

	userAuthTextTMPL *textTmpl.Template
	userAuthHTMLTMPL *htmlTmpl.Template
)

func init() {
	userAuthTextTMPL = textTmpl.Must(textTmpl.New("authText").Parse(userAuthTextTMPLStr))
	userAuthHTMLTMPL = htmlTmpl.Must(htmlTmpl.New("authHTML").Parse(userAuthHTMLTMPLStr))
}

type userMailContent struct {
	UserName    string
	Message     string
	Suffix      string
	ActionLabel string
	ActionURL   htmlTmpl.URL
}

type openIDConfiguration struct {
	UserinfoEndpoint string `json:"userinfo_endpoint"`
}

type userInfo struct {
	Sub      string `json:"sub"`
	Name     string `json:"name"`
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Error    string `json:"error"`
}

type UserInteractor struct {
	repos             *accountsInfra.Container
	gateways          *accountsGateway.Container
	signupSecret      string
	authSrvUIDomain   string
	query             interfaces.UserQuery
	accountsAPIClient *gqlclient.Client
}

func NewUserInteractor(ar *accountsInfra.Container, ag *accountsGateway.Container, signupSecret, authSrvUIDomain string, users []accountsUser.Repo, accountsAPIClient *gqlclient.Client) interfaces.User {
	return &UserInteractor{
		repos:             ar,
		gateways:          ag,
		signupSecret:      signupSecret,
		authSrvUIDomain:   authSrvUIDomain,
		query:             NewUserQueryInteractor(ar),
		accountsAPIClient: accountsAPIClient,
	}
}

func (i *UserInteractor) FetchByID(ctx context.Context, ids accountsUser.IDList) (accountsUser.List, error) {
	return i.query.FetchByID(ctx, ids)
}

func (i *UserInteractor) FetchBySub(ctx context.Context, sub string) (*accountsUser.User, error) {
	return i.query.FetchBySub(ctx, sub)
}

func (i *UserInteractor) FetchByNameOrEmail(ctx context.Context, nameOrEmail string) (*accountsUser.Simple, error) {
	return i.query.FetchByNameOrEmail(ctx, nameOrEmail)
}

func (i *UserInteractor) SearchUser(ctx context.Context, keyword string) (accountsUser.List, error) {
	return i.query.SearchUser(ctx, keyword)
}

func (i *UserInteractor) Signup(ctx context.Context, param interfaces.SignupParam) (u *accountsUser.User, err error) {
	if err := i.verifySignupSecret(param.Secret); err != nil {
		return nil, err
	}

	u, ws, err := accountsWorkspace.Init(accountsWorkspace.InitParams{
		Email:       param.Email,
		Name:        param.Name,
		Password:    lo.ToPtr(param.Password),
		Lang:        param.Lang,
		Theme:       param.Theme,
		UserID:      param.UserID,
		WorkspaceID: param.WorkspaceID,
	})
	if err != nil {
		return nil, err
	}

	vr := accountsUser.NewVerification()
	u.SetVerification(vr)

	if err := i.repos.User.Create(ctx, u); err != nil {
		if errors.Is(err, accountsUser.ErrDuplicatedUser) {
			return nil, errUserAlreadyExists
		}
		return nil, err
	}
	if err := i.repos.Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	if !param.MockAuth {
		if err := i.sendVerificationMail(ctx, u, vr); err != nil {
			return nil, err
		}
	}

	return u, nil
}

func (i *UserInteractor) SignupOIDC(ctx context.Context, param interfaces.SignupOIDCParam) (*accountsUser.User, error) {
	if err := i.verifySignupSecret(param.Secret); err != nil {
		return nil, err
	}

	sub := param.Sub
	name := param.Name
	email := param.Email
	if sub == "" || email == "" {
		ui, err := getUserInfoFromISSLocal(ctx, param.Issuer, param.AccessToken)
		if err != nil {
			return nil, err
		}
		sub = ui.Sub
		email = ui.Email
		if name == "" {
			name = ui.Nickname
		}
		if name == "" {
			name = ui.Name
		}
		if name == "" {
			name = ui.Email
		}
	}

	eu, err := i.repos.User.FindByEmail(ctx, param.Email)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}
	if eu != nil {
		return nil, accountsUser.ErrDuplicatedUser
	}

	eu, err = i.repos.User.FindBySub(ctx, param.Sub)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}
	if eu != nil {
		return nil, accountsUser.ErrDuplicatedUser
	}

	u, ws, err := accountsWorkspace.Init(accountsWorkspace.InitParams{
		Email:       email,
		Name:        name,
		Sub:         accountsUser.AuthFrom(sub).Ref(),
		Lang:        param.User.Lang,
		Theme:       param.User.Theme,
		UserID:      param.User.UserID,
		WorkspaceID: param.User.WorkspaceID,
	})
	if err != nil {
		return nil, err
	}

	if err := i.repos.User.Create(ctx, u); err != nil {
		return nil, err
	}

	if err := i.repos.Workspace.Save(ctx, ws); err != nil {
		return nil, err
	}

	return u, nil
}

func (i *UserInteractor) UpdateMe(ctx context.Context, p interfaces.UpdateMeParam, operator *accountsWorkspace.Operator) (u *accountsUser.User, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	if p.Password != nil {
		if p.PasswordConfirmation == nil || *p.Password != *p.PasswordConfirmation {
			return nil, errUserInvalidPasswordConfirmation
		}
	}

	var ws *accountsWorkspace.Workspace

	u, err = i.repos.User.FindByID(ctx, *operator.User)
	if err != nil {
		return nil, err
	}

	if p.Name != nil && *p.Name != u.Name() {
		oldName := u.Name()
		u.UpdateName(*p.Name)

		ws, err = i.repos.Workspace.FindByID(ctx, u.Workspace())
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return nil, err
		}

		tn := ws.Name()
		if tn == "" || tn == oldName {
			ws.Rename(*p.Name)
		} else {
			ws = nil
		}
	}
	if p.Email != nil {
		if err := u.UpdateEmail(*p.Email); err != nil {
			return nil, err
		}
	}
	if p.Lang != nil {
		md := u.Metadata()
		if md != nil {
			md.SetLang(*p.Lang)
		}
	}
	if p.Theme != nil {
		md := u.Metadata()
		if md != nil {
			md.SetTheme(*p.Theme)
		}
	}

	if p.Password != nil && u.HasAuthProvider("reearth") {
		if err := u.SetPassword(*p.Password); err != nil {
			return nil, err
		}
	}

	// Update Auth0 users
	if i.gateways != nil && (p.Name != nil || p.Email != nil || p.Password != nil) {
		for _, a := range u.Auths() {
			if a.Provider != "auth0" {
				continue
			}
			if _, err := i.gateways.Authenticator.UpdateUser(ctx, accountsGateway.AuthenticatorUpdateUserParam{
				ID:       a.Sub,
				Name:     p.Name,
				Email:    p.Email,
				Password: p.Password,
			}); err != nil {
				return nil, err
			}
		}
	}

	if ws != nil {
		err = i.repos.Workspace.Save(ctx, ws)
		if err != nil {
			return nil, err
		}
	}

	err = i.repos.User.Save(ctx, u)
	if err != nil {
		return nil, err
	}

	return u, nil
}

func (i *UserInteractor) RemoveMyAuth(ctx context.Context, authProvider string, operator *accountsWorkspace.Operator) (u *accountsUser.User, err error) {
	if operator == nil || operator.User == nil {
		return nil, errInvalidOperator
	}

	if i.accountsAPIClient != nil {
		u, err := i.accountsAPIClient.UserRepo.RemoveMyAuth(ctx, authProvider)
		if err != nil {
			return nil, err
		}
		return u, nil
	}

	u, err = i.repos.User.FindByID(ctx, *operator.User)
	if err != nil {
		return nil, err
	}

	u.RemoveAuthByProvider(authProvider)

	err = i.repos.User.Save(ctx, u)
	if err != nil {
		return nil, err
	}

	return u, nil
}

func (i *UserInteractor) DeleteMe(ctx context.Context, userID accountsUser.ID, operator *accountsWorkspace.Operator) (err error) {
	if operator == nil || operator.User == nil {
		return errInvalidOperator
	}

	if userID.IsNil() || userID != *operator.User {
		return errors.New("invalid user id")
	}

	if i.accountsAPIClient != nil {
		return i.accountsAPIClient.UserRepo.DeleteMe(ctx, userID.String())
	}

	u, err := i.repos.User.FindByID(ctx, userID)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return err
	}
	if u == nil {
		return nil
	}

	workspaces, err := i.repos.Workspace.FindByUser(ctx, u.ID())
	if err != nil {
		return err
	}

	updatedWorkspaces := make([]*accountsWorkspace.Workspace, 0, len(workspaces))
	deletedWorkspaces := []accountsUser.WorkspaceID{}

	for _, ws := range workspaces {
		if !ws.IsPersonal() && !ws.Members().IsOnlyOwner(u.ID()) {
			_ = ws.Members().Leave(u.ID())
			updatedWorkspaces = append(updatedWorkspaces, ws)
			continue
		}
		deletedWorkspaces = append(deletedWorkspaces, ws.ID())
	}

	if err := i.repos.Workspace.SaveAll(ctx, updatedWorkspaces); err != nil {
		return err
	}

	if err := i.repos.Workspace.RemoveAll(ctx, deletedWorkspaces); err != nil {
		return err
	}

	if err := i.repos.User.Remove(ctx, u.ID()); err != nil {
		return err
	}

	return nil
}

func (i *UserInteractor) CreateVerification(ctx context.Context, email string) error {
	if i.accountsAPIClient != nil {
		_, err := i.accountsAPIClient.UserRepo.CreateVerification(ctx, email)
		return err
	}

	u, err := i.repos.User.FindByEmail(ctx, email)
	if err != nil {
		return err
	}
	if u.Verification().IsVerified() {
		return nil
	}
	vr := accountsUser.NewVerification()
	u.SetVerification(vr)

	if err := i.repos.User.Save(ctx, u); err != nil {
		return err
	}

	if err := i.sendVerificationMail(ctx, u, vr); err != nil {
		return err
	}

	return nil
}

func (i *UserInteractor) VerifyUser(ctx context.Context, code string) (*accountsUser.User, error) {
	if i.accountsAPIClient != nil {
		return i.accountsAPIClient.UserRepo.VerifyUser(ctx, code)
	}

	u, err := i.repos.User.FindByVerification(ctx, code)
	if err != nil {
		return nil, err
	}
	if u.Verification().IsExpired() {
		return nil, errors.New("verification expired")
	}
	u.Verification().SetVerified(true)
	err = i.repos.User.Save(ctx, u)
	if err != nil {
		return nil, err
	}

	return u, nil
}

func (i *UserInteractor) StartPasswordReset(ctx context.Context, email string) error {
	if i.accountsAPIClient != nil {
		return i.accountsAPIClient.UserRepo.StartPasswordReset(ctx, email)
	}

	u, err := i.repos.User.FindByEmail(ctx, email)
	if err != nil {
		return err
	}

	a := u.Auths().GetByProvider(accountsUser.ProviderReearth)
	if a == nil || a.Sub == "" {
		return errUserInvalidPasswordReset
	}

	pr := accountsUser.NewPasswordReset()
	u.SetPasswordReset(pr)

	if err := i.repos.User.Save(ctx, u); err != nil {
		return err
	}

	var TextOut, HTMLOut bytes.Buffer
	link := i.authSrvUIDomain + "/?pwd-reset-token=" + pr.Token
	content := userMailContent{
		UserName:    u.Name(),
		Message:     "Thank you for using Re:Earth. We've received a request to reset your password. If this was you, please click the link below to confirm and change your password.",
		Suffix:      "If you did not mean to reset your password, then you can ignore this email.",
		ActionLabel: "Confirm to reset your password",
		ActionURL:   htmlTmpl.URL(link),
	}

	if err := userAuthTextTMPL.Execute(&TextOut, content); err != nil {
		return err
	}
	if err := userAuthHTMLTMPL.Execute(&HTMLOut, content); err != nil {
		return err
	}

	if i.gateways != nil {
		return i.gateways.Mailer.SendMail(ctx, []mailer.Contact{
			{Email: u.Email(), Name: u.Name()},
		}, "Password reset", TextOut.String(), HTMLOut.String())
	}

	return nil
}

func (i *UserInteractor) PasswordReset(ctx context.Context, password string, token string) error {
	if i.accountsAPIClient != nil {
		return i.accountsAPIClient.UserRepo.PasswordReset(ctx, password, token)
	}

	u, err := i.repos.User.FindByPasswordResetRequest(ctx, token)
	if err != nil {
		return err
	}

	passwordReset := u.PasswordReset()
	ok := passwordReset.Validate(token)
	if !ok {
		return errUserInvalidPasswordReset
	}

	a := u.Auths().GetByProvider(accountsUser.ProviderReearth)
	if a == nil || a.Sub == "" {
		return errUserInvalidPasswordReset
	}

	if err := u.SetPassword(password); err != nil {
		return err
	}

	u.SetPasswordReset(nil)

	if err := i.repos.User.Save(ctx, u); err != nil {
		return err
	}

	return nil
}

func (i *UserInteractor) verifySignupSecret(secret *string) error {
	if i.signupSecret != "" && (secret == nil || *secret != i.signupSecret) {
		return errSignupInvalidSecret
	}
	return nil
}

func (i *UserInteractor) sendVerificationMail(ctx context.Context, u *accountsUser.User, vr *accountsUser.Verification) error {
	if i.gateways == nil {
		return nil
	}

	var text, html bytes.Buffer
	link := i.authSrvUIDomain + "/?user-verification-token=" + vr.Code()
	content := userMailContent{
		Message:     "Thank you for signing up to Re:Earth. Please verify your email address by clicking the button below.",
		Suffix:      "You can use this email address to log in to Re:Earth account anytime.",
		ActionLabel: "Activate your account and log in",
		UserName:    u.Email(),
		ActionURL:   htmlTmpl.URL(link),
	}
	if err := userAuthTextTMPL.Execute(&text, content); err != nil {
		return err
	}
	if err := userAuthHTMLTMPL.Execute(&html, content); err != nil {
		return err
	}

	return i.gateways.Mailer.SendMail(ctx, []mailer.Contact{
		{Email: u.Email(), Name: u.Name()},
	}, "email verification", text.String(), html.String())
}

// UserQueryInteractor queries users across multiple repositories.
type UserQueryInteractor struct {
	repos []accountsUser.Repo
}

func NewUserQueryInteractor(ar *accountsInfra.Container) *UserQueryInteractor {
	repos := []accountsUser.Repo{ar.User}
	if len(ar.Users) > 0 {
		repos = append(repos, ar.Users...)
	}
	return &UserQueryInteractor{repos: repos}
}

func (q *UserQueryInteractor) FetchByID(ctx context.Context, ids accountsUser.IDList) (accountsUser.List, error) {
	us := make(accountsUser.List, len(ids))
	for _, r := range q.repos {
		u, err := r.FindByIDs(ctx, ids)
		if err != nil {
			return nil, err
		}
		for j, uu := range u {
			if uu != nil && us[j] == nil {
				us[j] = uu
			}
		}
	}
	return us, nil
}

func (q *UserQueryInteractor) FetchBySub(ctx context.Context, sub string) (*accountsUser.User, error) {
	for _, r := range q.repos {
		u, err := r.FindBySub(ctx, sub)
		if errors.Is(err, rerror.ErrNotFound) {
			continue
		}
		if err != nil {
			return nil, err
		}
		return u, nil
	}
	return nil, rerror.ErrNotFound
}

func (q *UserQueryInteractor) FetchByNameOrEmail(ctx context.Context, nameOrEmail string) (*accountsUser.Simple, error) {
	for _, r := range q.repos {
		u, err := r.FindByNameOrEmail(ctx, nameOrEmail)
		if errors.Is(err, rerror.ErrNotFound) {
			continue
		}
		if err != nil {
			return nil, err
		}
		return accountsUser.SimpleFrom(u), nil
	}
	return nil, nil
}

func (q *UserQueryInteractor) SearchUser(ctx context.Context, keyword string) (accountsUser.List, error) {
	for _, r := range q.repos {
		u, err := r.SearchByKeyword(ctx, keyword)
		if errors.Is(err, rerror.ErrNotFound) {
			continue
		}
		if err != nil {
			return nil, err
		}
		if len(u) > 0 {
			return u, nil
		}
	}
	return nil, nil
}

// OIDC helpers

func getUserInfoFromISSLocal(ctx context.Context, iss, accessToken string) (userInfo, error) {
	if accessToken == "" {
		return userInfo{}, errors.New("invalid access token")
	}
	if iss == "" {
		return userInfo{}, errors.New("invalid issuer")
	}

	var u string
	c, err := getOpenIDConfigurationLocal(ctx, iss)
	if err != nil {
		u2 := issToURLLocal(iss, "/userinfo")
		if u2 == nil {
			return userInfo{}, errors.New("invalid iss")
		}
		u = u2.String()
	} else {
		u = c.UserinfoEndpoint
	}
	return getUserInfoLocal(ctx, u, accessToken)
}

func getOpenIDConfigurationLocal(ctx context.Context, iss string) (c openIDConfiguration, err error) {
	wkURL := issToURLLocal(iss, "/.well-known/openid-configuration")
	if wkURL == nil {
		return c, errors.New("invalid iss")
	}

	if ctx == nil {
		ctx = context.Background()
	}

	req, err2 := http.NewRequestWithContext(ctx, http.MethodGet, wkURL.String(), nil)
	if err2 != nil {
		return c, err2
	}

	res, err2 := http.DefaultClient.Do(req)
	if err2 != nil {
		return c, err2
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return c, errors.New("could not get user info")
	}

	if err2 := json.NewDecoder(res.Body).Decode(&c); err2 != nil {
		return c, fmt.Errorf("could not get user info: %w", err2)
	}

	return c, nil
}

func getUserInfoLocal(ctx context.Context, urlStr, accessToken string) (ui userInfo, err error) {
	if ctx == nil {
		ctx = context.Background()
	}

	req, err2 := http.NewRequestWithContext(ctx, http.MethodGet, urlStr, nil)
	if err2 != nil {
		return ui, err2
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	res, err2 := http.DefaultClient.Do(req)
	if err2 != nil {
		return ui, err2
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return ui, errors.New("could not get user info")
	}

	if err2 := json.NewDecoder(res.Body).Decode(&ui); err2 != nil {
		return ui, fmt.Errorf("could not get user info: %w", err2)
	}

	if ui.Error != "" {
		return ui, fmt.Errorf("could not get user info: %s", ui.Error)
	}
	if ui.Sub == "" {
		return ui, fmt.Errorf("could not get user info: invalid response")
	}
	if ui.Email == "" {
		return ui, fmt.Errorf("could not get user info: email scope missing")
	}

	return ui, nil
}

func issToURLLocal(iss, p string) *url.URL {
	if iss == "" {
		return nil
	}

	if !strings.HasPrefix(iss, "https://") && !strings.HasPrefix(iss, "http://") {
		iss = "https://" + iss
	}

	u, err := url.Parse(iss)
	if err == nil {
		u.Path = path.Join(u.Path, p)
		if u.Path == "/" {
			u.Path = ""
		}
		return u
	}

	return nil
}
