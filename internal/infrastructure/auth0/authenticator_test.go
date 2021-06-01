package auth0

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

const (
	token        = "a"
	clientID     = "b"
	clientSecret = "c"
	domain       = "https://reearth-dev.auth0.com/"
	userID       = "x"
	expiresIn    = 24 * 60 * 60
	userName     = "d"
	userEmail    = "e"
)

var (
	current  = time.Date(2020, time.April, 1, 0, 0, 0, 0, time.UTC)
	current2 = time.Date(2020, time.April, 1, 23, 0, 0, 0, time.UTC)
)

func TestURLFromDomain(t *testing.T) {
	assert.Equal(t, "https://a/", urlFromDomain("a"))
	assert.Equal(t, "https://a/", urlFromDomain("a/"))
}

func TestAuth0(t *testing.T) {
	a := New(domain, clientID, clientSecret)
	a.client = client(t) // inject mock
	a.current = func() time.Time { return current }
	a.disableLogging = true

	assert.True(t, a.needsFetchToken())
	assert.NoError(t, a.updateToken())
	assert.Equal(t, token, a.token)
	assert.Equal(t, current.Add(time.Second*expiresIn), a.expireAt)
	assert.False(t, a.needsFetchToken())

	a.current = func() time.Time { return current2 }
	assert.True(t, a.needsFetchToken())
	a.current = func() time.Time { return current }

	r, err := a.FetchUser(userID)
	assert.NoError(t, err)
	assert.Equal(t, gateway.AuthenticatorUser{
		ID:            userID,
		Email:         userEmail,
		EmailVerified: true,
		Name:          userName,
	}, r)

	_, err = a.FetchUser(token)
	assert.Error(t, err)

	newEmail := "xxxxx"
	r, err = a.UpdateUser(gateway.AuthenticatorUpdateUserParam{
		ID:    userID,
		Email: &newEmail,
	})
	assert.NoError(t, err)
	assert.Equal(t, gateway.AuthenticatorUser{
		ID:            userID,
		Email:         newEmail,
		EmailVerified: true,
		Name:          userName,
	}, r)

	a.current = func() time.Time { return current2 }
	_, err = a.FetchUser(token + "a")
	assert.Error(t, err)
	assert.Equal(t, current2.Add(time.Second*expiresIn), a.expireAt)
}

func res(i interface{}) io.ReadCloser {
	b, _ := json.Marshal(i)
	return io.NopCloser(bytes.NewBuffer(b))
}

func client(t *testing.T) *http.Client {
	t.Helper()

	return &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			p := req.URL.Path
			var body map[string]string
			if req.Body != nil {
				_ = json.NewDecoder(req.Body).Decode(&body)
			}

			if req.Method == http.MethodPost && p == "/oauth/token" {
				assert.Equal(t, domain+"api/v2/", body["audience"])
				assert.Equal(t, "client_credentials", body["grant_type"])
				assert.Equal(t, clientID, body["client_id"])
				assert.Equal(t, clientSecret, body["client_secret"])
				return &http.Response{
					StatusCode: http.StatusOK,
					Body: res(map[string]interface{}{
						"access_token": token,
						"expires_in":   expiresIn,
					}),
					Header: make(http.Header),
				}
			}

			if req.Method == http.MethodGet && p == "/api/v2/users/"+userID {
				tok := strings.TrimPrefix(req.Header.Get("Authorization"), "Bearer ")
				if token != tok {
					return &http.Response{
						StatusCode: http.StatusUnauthorized,
						Body: res(map[string]interface{}{
							"message": "Unauthorized",
						}),
						Header: make(http.Header),
					}
				}

				return &http.Response{
					StatusCode: http.StatusOK,
					Body: res(map[string]interface{}{
						"user_id":        userID,
						"username":       userName,
						"email":          userEmail,
						"email_verified": true,
					}),
					Header: make(http.Header),
				}
			}

			if req.Method == http.MethodPatch && p == "/api/v2/users/"+userID {
				tok := strings.TrimPrefix(req.Header.Get("Authorization"), "Bearer ")
				if token != tok {
					return &http.Response{
						StatusCode: http.StatusUnauthorized,
						Body: res(map[string]interface{}{
							"message": "Unauthorized",
						}),
						Header: make(http.Header),
					}
				}

				username := userName
				email := userEmail
				if body["username"] != "" {
					username = body["username"]
				}
				if body["email"] != "" {
					email = body["email"]
				}
				return &http.Response{
					StatusCode: http.StatusOK,
					Body: res(map[string]interface{}{
						"user_id":        userID,
						"username":       username,
						"email":          email,
						"email_verified": true,
					}),
					Header: make(http.Header),
				}
			}

			return &http.Response{
				StatusCode: http.StatusNotFound,
				Body: res(map[string]interface{}{
					"message": "Not found",
				}),
				Header: make(http.Header),
			}
		}),
	}
}

type RoundTripFunc func(req *http.Request) *http.Response

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req), nil
}
