package auth0

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

const (
	token        = "a"
	clientID     = "clientclient"
	clientSecret = "secretsecret"
	domain       = "https://reearth-dev.auth0.com/"
	userID       = "x"
	expiresIn    = 24 * 60 * 60
	userName     = "d"
	userEmail    = "e"
)

func TestAuth0(t *testing.T) {
	a := New(domain, clientID, clientSecret)
	a.disableLogging = true

	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponder("POST", domain+"oauth/token", func(req *http.Request) (*http.Response, error) {
		_ = req.ParseForm()
		assert.Equal(t, domain+"api/v2/", req.Form.Get("audience"))
		assert.Equal(t, "client_credentials", req.Form.Get("grant_type"))
		assert.Equal(t, "read:users update:users", req.Form.Get("scope"))
		assert.Equal(t, clientID, req.Form.Get("client_id"))
		assert.Equal(t, clientSecret, req.Form.Get("client_secret"))
		return httpmock.NewJsonResponse(http.StatusOK, map[string]any{
			"access_token": token,
			"token_type":   "Bearer",
			"scope":        "read:users update:users",
			"expires_in":   expiresIn,
		})
	})

	httpmock.RegisterResponder("GET", domain+"api/v2/users/"+userID, func(req *http.Request) (*http.Response, error) {
		if token != strings.TrimPrefix(req.Header.Get("Authorization"), "Bearer ") {
			return httpmock.NewJsonResponse(http.StatusOK, map[string]any{
				"message": "Unauthorized",
			})
		}

		return httpmock.NewJsonResponse(http.StatusOK, map[string]any{
			"user_id":        userID,
			"username":       userName,
			"email":          userEmail,
			"email_verified": true,
		})
	})

	httpmock.RegisterResponder("PATCH", domain+"api/v2/users/"+userID, func(req *http.Request) (*http.Response, error) {
		if token != strings.TrimPrefix(req.Header.Get("Authorization"), "Bearer ") {
			return httpmock.NewJsonResponse(http.StatusOK, map[string]any{
				"message": "Unauthorized",
			})
		}

		var body map[string]string
		_ = json.NewDecoder(req.Body).Decode(&body)

		resEmail := body["email"]
		if resEmail == "" {
			resEmail = userEmail
		}

		resUsername := body["username"]
		if resUsername == "" {
			resUsername = userName
		}

		return httpmock.NewJsonResponse(http.StatusOK, map[string]any{
			"user_id":        userID,
			"username":       resUsername,
			"email":          resEmail,
			"email_verified": true,
		})
	})

	newEmail := "xxxxx"
	r, err := a.UpdateUser(gateway.AuthenticatorUpdateUserParam{
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
}

func TestURLFromDomain(t *testing.T) {
	assert.Equal(t, "https://a/", urlFromDomain("a"))
	assert.Equal(t, "https://a/", urlFromDomain("a/"))
}
