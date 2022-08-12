package auth0

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
)

type Auth0 struct {
	base           string
	client         *http.Client
	disableLogging bool
}

type response struct {
	ID               string `json:"user_id"`
	Name             string `json:"name"`
	UserName         string `json:"username"`
	Email            string `json:"email"`
	EmailVerified    bool   `json:"email_verified"`
	Message          string `json:"message"`
	ErrorDescription string `json:"error_description"`
}

func (u response) Into() gateway.AuthenticatorUser {
	name := u.UserName
	if name == "" {
		name = u.Name
	}

	return gateway.AuthenticatorUser{
		ID:            u.ID,
		Name:          name,
		Email:         u.Email,
		EmailVerified: u.EmailVerified,
	}
}

func (u response) Error() string {
	if u.ErrorDescription != "" {
		return u.ErrorDescription
	}
	return u.Message
}

func New(domain, clientID, clientSecret string) *Auth0 {
	base := urlFromDomain(domain)
	conf := clientcredentials.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		TokenURL:     base + "oauth/token",
		Scopes:       []string{"read:users", "update:users"},
		AuthStyle:    oauth2.AuthStyleInParams,
		EndpointParams: url.Values{
			"audience": []string{base + "api/v2/"},
		},
	}
	return &Auth0{
		base:   base,
		client: conf.Client(context.Background()),
	}
}

func (a *Auth0) UpdateUser(p gateway.AuthenticatorUpdateUserParam) (data gateway.AuthenticatorUser, err error) {
	if err != nil {
		return
	}

	payload := map[string]string{}
	if p.Name != nil {
		payload["name"] = *p.Name
	}
	if p.Email != nil {
		payload["email"] = *p.Email
	}
	if p.Password != nil {
		payload["password"] = *p.Password
	}
	if len(payload) == 0 {
		err = errors.New("nothing is updated")
		return
	}

	var r response
	r, err = a.exec(http.MethodPatch, "api/v2/users/"+p.ID, payload)
	if err != nil {
		err = rerror.ErrInternalByWith("failed to update user", err)
		return
	}

	data = r.Into()
	return
}

func (a *Auth0) exec(method, path string, b any) (r response, err error) {
	if a == nil || a.base == "" {
		err = errors.New("auth0: domain is not set")
		return
	}

	var body io.Reader = nil
	if b != nil {
		if b2, ok := b.([]byte); ok {
			body = bytes.NewReader(b2)
		} else {
			var b2 []byte
			b2, err = json.Marshal(b)
			if err != nil {
				return
			}
			body = bytes.NewReader(b2)
		}
	}

	var req *http.Request
	req, err = http.NewRequest(method, a.base+path, body)
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := a.client.Do(req)
	if err != nil {
		return
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	respb, err := io.ReadAll(resp.Body)
	if err != nil {
		return
	}

	if !a.disableLogging {
		log.Infof("auth0: path: %s, status: %d, resp: %s", path, resp.StatusCode, respb)
	}

	if err = json.Unmarshal(respb, &r); err != nil {
		return
	}

	if resp.StatusCode >= 300 {
		err = errors.New(r.Error())
		return
	}
	return
}

func urlFromDomain(path string) string {
	if path == "" {
		return path
	}
	if !strings.HasPrefix(path, "http://") && !strings.HasPrefix(path, "https://") {
		path = "https://" + path
	}
	return strings.TrimSuffix(path, "/") + "/"
}
