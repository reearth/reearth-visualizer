package auth0

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/log"
)

type Auth0 struct {
	domain       string
	client       *http.Client
	clientID     string
	clientSecret string
	token        string
	expireAt     time.Time
	lock         sync.Mutex
	current      func() time.Time
}

type response struct {
	ID            string `json:"user_id"`
	Name          string `json:"name"`
	UserName      string `json:"username"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Message       string `json:"string"`
	Token         string `json:"access_token"`
	ExpiresIn     int64  `json:"expires_in"`
}

func currentTime() time.Time {
	return time.Now()
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

func New(domain, clientID, clientSecret string) *Auth0 {
	return &Auth0{
		domain:       addPathSep(domain),
		clientID:     clientID,
		clientSecret: clientSecret,
	}
}

func (a *Auth0) FetchUser(id string) (data gateway.AuthenticatorUser, err error) {
	err = a.updateToken()
	if err != nil {
		return
	}

	var r response
	r, err = a.exec(http.MethodGet, "api/v2/users/"+id, a.token, nil)
	if err != nil {
		log.Errorf("auth0: fetch user: %s", err)
		err = fmt.Errorf("failed to auth")
		return
	}
	data = r.Into()
	return
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
		log.Errorf("auth0: update user: %s", err)
		err = fmt.Errorf("failed to update user")
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
		"audience":      a.domain + "api/v2/",
		"grant_type":    "client_credentials",
	})
	if err != nil {
		return err
	}

	if a.current == nil {
		a.current = currentTime
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
	req, err = http.NewRequest(method, a.domain+path, body)
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

	err = json.NewDecoder(resp.Body).Decode(&r)
	if err != nil {
		return
	}
	if resp.StatusCode >= 300 {
		err = errors.New(r.Message)
		return
	}
	return
}

func addPathSep(path string) string {
	if path == "" {
		return path
	}
	if path[len(path)-1] != '/' {
		path += "/"
	}
	return path
}
