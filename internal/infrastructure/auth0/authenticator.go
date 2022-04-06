package auth0

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/log"
)

type Auth0 struct {
	domain         string
	client         *http.Client
	clientID       string
	clientSecret   string
	token          string
	expireAt       time.Time
	lock           sync.Mutex
	current        func() time.Time
	disableLogging bool
}

func currentTime() time.Time {
	return time.Now()
}

type response struct {
	ID               string `json:"user_id"`
	Name             string `json:"name"`
	UserName         string `json:"username"`
	Email            string `json:"email"`
	EmailVerified    bool   `json:"email_verified"`
	Message          string `json:"message"`
	Token            string `json:"access_token"`
	Scope            string `json:"scope"`
	ExpiresIn        int64  `json:"expires_in"`
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
	return &Auth0{
		domain:       urlFromDomain(domain),
		clientID:     clientID,
		clientSecret: clientSecret,
	}
}

func (a *Auth0) UpdateUser(p gateway.AuthenticatorUpdateUserParam) (data gateway.AuthenticatorUser, err error) {
	err = a.updateToken()
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
	r, err = a.exec(http.MethodPatch, "api/v2/users/"+p.ID, a.token, payload)
	if err != nil {
		if !a.disableLogging {
			log.Errorf("auth0: update user: %+v", err)
		}
		err = errors.New("failed to update user")
		return
	}

	data = r.Into()
	return
}

func (a *Auth0) needsFetchToken() bool {
	if a == nil {
		return false
	}
	if a.current == nil {
		a.current = currentTime
	}
	return a.expireAt.IsZero() || a.expireAt.Sub(a.current()) <= time.Hour
}

func (a *Auth0) updateToken() error {
	if a == nil || !a.needsFetchToken() {
		return nil
	}

	if a.clientID == "" || a.clientSecret == "" || a.domain == "" {
		return errors.New("auth0 is not set up")
	}

	a.lock.Lock()
	defer a.lock.Unlock()

	if !a.needsFetchToken() {
		return nil
	}

	r, err := a.exec(http.MethodPost, "oauth/token", "", map[string]string{
		"client_id":     a.clientID,
		"client_secret": a.clientSecret,
		"audience":      urlFromDomain(a.domain) + "api/v2/",
		"grant_type":    "client_credentials",
		"scope":         "read:users update:users",
	})
	if err != nil {
		if !a.disableLogging {
			log.Errorf("auth0: access token error: %+v", err)
		}
		return errors.New("failed to auth")
	}

	if a.current == nil {
		a.current = currentTime
	}

	if r.Token == "" {
		if !a.disableLogging {
			log.Errorf("auth0: no token: %+v", r)
		}
		return errors.New("failed to auth")
	}
	a.token = r.Token
	a.expireAt = a.current().Add(time.Duration(r.ExpiresIn * int64(time.Second)))

	return nil
}

func (a *Auth0) exec(method, path, token string, b interface{}) (r response, err error) {
	if a == nil || a.domain == "" {
		err = errors.New("auth0: domain is not set")
		return
	}
	if a.client == nil {
		a.client = http.DefaultClient
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
	req, err = http.NewRequest(method, urlFromDomain(a.domain)+path, body)
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

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
	if path[len(path)-1] != '/' {
		path += "/"
	}
	return path
}
