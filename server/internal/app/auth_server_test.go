package app

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/authserver"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"gopkg.in/square/go-jose.v2"
	"gopkg.in/square/go-jose.v2/jwt"
)

func init() {
	mongotest.Env = "REEARTH_DB"
}

func TestEndpoint(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	e := echo.New()
	lr := lo.Must(mongo.NewLock(db.Collection("locks")))
	cr := mongo.NewConfig(db.Collection("config"), lr)
	ur := accountmongo.NewUser(mongox.NewClientWithDatabase(db))
	rr := authserver.NewMongo(mongox.NewClientCollection(db.Collection("authRequest")))

	uid := user.NewID()
	usr := user.New().ID(uid).
		Name("aaa").
		Workspace(user.NewWorkspaceID()).
		Email("aaa@example.com").
		Auths(user.Auths{user.NewReearthAuth("subsub")}).
		PasswordPlainText("Xyzxyz123").
		Verification(user.VerificationFrom("", time.Time{}, true)).
		MustBuild()
	lo.Must0(ur.Save(ctx, usr))

	ts := httptest.NewServer(e)
	defer ts.Close()

	authServer(ctx, e, &config.AuthSrvConfig{
		Domain:   "https://example.com",
		UIDomain: "https://web.example.com",
	}, &repo.Container{
		AuthRequest: rr,
		Config:      cr,
		User:        ur,
	})

	// step 1
	verifier, challenge := randomCodeChallenge()
	res := send(http.MethodGet, ts.URL+"/authorize", false, map[string]string{
		"response_type":         "code",
		"client_id":             config.AuthServerDefaultClientID,
		"redirect_uri":          "https://web.example.com",
		"scope":                 "openid email profile",
		"state":                 "hogestate",
		"code_challenge":        challenge,
		"code_challenge_method": "S256",
	}, nil)
	assert.Equal(t, http.StatusFound, res.StatusCode)
	loc := res.Header.Get("Location")
	assert.Contains(t, loc, "https://web.example.com/login?id=")
	reqID := lo.Must(url.Parse(loc)).Query().Get("id")

	// step 2
	res = send(http.MethodPost, ts.URL+"/api/login", true, map[string]string{
		"username": "aaa@example.com",
		"password": "xyzxyz123",
		"id":       reqID,
	}, nil)
	assert.Equal(t, http.StatusFound, res.StatusCode)
	assert.Equal(t, "https://web.example.com/login?error=Login+failed%3B+Invalid+s+ID+or+password.&id="+reqID, res.Header.Get("Location"))

	res = send(http.MethodPost, ts.URL+"/api/login", true, map[string]string{
		"username": "aaa@example.com",
		"password": "Xyzxyz123",
		"id":       reqID,
	}, nil)
	assert.Equal(t, http.StatusFound, res.StatusCode)
	assert.Equal(t, "https://example.com/authorize/callback?id="+reqID, res.Header.Get("Location"))

	// step 3
	res = send(http.MethodGet, ts.URL+"/authorize/callback?id="+reqID, false, nil, nil)
	assert.Equal(t, http.StatusFound, res.StatusCode)
	loc = res.Header.Get("Location")
	assert.Contains(t, loc, "https://web.example.com?code=")
	locu := lo.Must(url.Parse(loc))
	assert.Equal(t, "hogestate", locu.Query().Get("state"))
	code := locu.Query().Get("code")

	// step 4
	res2 := send(http.MethodPost, ts.URL+"/oauth/token", true, map[string]string{
		"grant_type":    "authorization_code",
		"redirect_uri":  "https://web.example.com",
		"client_id":     config.AuthServerDefaultClientID,
		"code":          code,
		"code_verifier": verifier,
	}, nil)
	var r map[string]any
	lo.Must0(json.Unmarshal(lo.Must(io.ReadAll(res2.Body)), &r))
	assert.Equal(t, map[string]any{
		"id_token":     r["id_token"],
		"access_token": r["access_token"],
		"expires_in":   r["expires_in"],
		"token_type":   "Bearer",
		"state":        "hogestate",
	}, r)
	accessToken := r["access_token"].(string)
	idToken := r["id_token"].(string)

	// userinfo
	res3 := send(http.MethodGet, ts.URL+"/userinfo", false, nil, map[string]string{
		"Authorization": "Bearer " + accessToken,
	})
	var r2 map[string]any
	lo.Must0(json.Unmarshal(lo.Must(io.ReadAll(res3.Body)), &r2))
	assert.Equal(t, map[string]any{
		"sub":            "reearth|subsub",
		"email":          "aaa@example.com",
		"name":           "aaa",
		"email_verified": true,
	}, r2)

	// openid-configuration
	res4 := send(http.MethodGet, ts.URL+"/.well-known/openid-configuration", false, nil, nil)
	var r3 map[string]any
	lo.Must0(json.Unmarshal(lo.Must(io.ReadAll(res4.Body)), &r3))
	assert.Equal(t, "https://example.com/jwks.json", r3["jwks_uri"])

	// jwks
	res5 := send(http.MethodGet, ts.URL+"/jwks.json", false, nil, nil)
	var jwks jose.JSONWebKeySet
	lo.Must0(json.Unmarshal(lo.Must(io.ReadAll(res5.Body)), &jwks))

	// validate access_token
	token := lo.Must(jwt.ParseSigned(accessToken))
	header, _ := lo.Find(token.Headers, func(h jose.Header) bool {
		return h.Algorithm == string(jose.RS256)
	})
	key := jwks.Key(header.KeyID)[0]
	claims := map[string]any{}
	lo.Must0(token.Claims(key.Key, &claims))
	assert.Equal(t, map[string]any{
		"iss": "https://example.com/",
		"sub": "reearth|subsub",
		"aud": []any{"https://example.com"},
		"jti": claims["jti"],
		"exp": claims["exp"],
		"nbf": claims["nbf"],
		"iat": claims["iat"],
	}, claims)

	// validate id_token
	token2 := lo.Must(jwt.ParseSigned(idToken))
	header2, _ := lo.Find(token2.Headers, func(h jose.Header) bool {
		return h.Algorithm == string(jose.RS256)
	})
	key2 := jwks.Key(header2.KeyID)[0]
	claims2 := map[string]any{}
	lo.Must0(token.Claims(key2.Key, &claims2))
	assert.Equal(t, map[string]any{
		"iss": "https://example.com/",
		"sub": "reearth|subsub",
		"aud": []any{"https://example.com"},
		"jti": claims["jti"],
		"exp": claims["exp"],
		"nbf": claims["nbf"],
		"iat": claims["iat"],
	}, claims2)
}

var httpClient = &http.Client{
	CheckRedirect: func(req *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	},
}

func send(method, u string, form bool, body any, headers map[string]string) *http.Response {
	var b io.Reader
	if body != nil {
		if method == http.MethodPost || method == http.MethodPatch || method == http.MethodPut {
			if form {
				values := url.Values{}
				for k, v := range body.(map[string]string) {
					values.Set(k, v)
				}
				b = strings.NewReader(values.Encode())
			} else {
				j := lo.Must(json.Marshal(body))
				b = bytes.NewReader(j)
			}
		} else if b, ok := body.(map[string]string); ok {
			u2 := lo.Must(url.Parse(u))
			q := u2.Query()
			for k, v := range b {
				q.Set(k, v)
			}
			u2.RawQuery = q.Encode()
			u = u2.String()
		}
	}

	req := lo.Must(http.NewRequest(method, u, b))
	if b != nil {
		if !form {
			req.Header.Set("Content-Type", "application/json")
		} else {
			req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		}
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	return lo.Must(httpClient.Do(req))
}

func codeChallenge(seed []byte) (string, string) {
	verifier := base64.RawURLEncoding.EncodeToString(seed)
	challengeSum := sha256.Sum256([]byte(verifier))
	challenge := strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(base64.StdEncoding.EncodeToString(challengeSum[:]), "+", "-"), "/", "_"), "=", "")
	return verifier, challenge
}

func randomCodeChallenge() (string, string) {
	seed := make([]byte, 32)
	_, _ = rand.Read(seed)
	return codeChallenge(seed)
}
