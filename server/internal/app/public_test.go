package app

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestPublishedAuthMiddleware(t *testing.T) {
	tests := []struct {
		Name              string
		PublishedName     string
		BasicAuthUsername string
		BasicAuthPassword string
		Error             error
	}{
		{
			Name: "empty name",
		},
		{
			Name:          "not found",
			PublishedName: "aaa",
		},
		{
			Name:          "no auth",
			PublishedName: "inactive",
		},
		{
			Name:          "auth",
			PublishedName: "active",
			Error:         echo.ErrUnauthorized,
		},
		{
			Name:              "auth with invalid credentials",
			PublishedName:     "active",
			BasicAuthUsername: "aaa",
			BasicAuthPassword: "bbb",
			Error:             echo.ErrUnauthorized,
		},
		{
			Name:              "auth with valid credentials",
			PublishedName:     "active",
			BasicAuthUsername: "fooo",
			BasicAuthPassword: "baar",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			assert := assert.New(t)
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			if tc.BasicAuthUsername != "" {
				req.Header.Set(echo.HeaderAuthorization, "basic "+base64.StdEncoding.EncodeToString([]byte(tc.BasicAuthUsername+":"+tc.BasicAuthPassword)))
			}
			res := httptest.NewRecorder()
			e := echo.New()
			c := e.NewContext(req, res)
			c.SetParamNames("name")
			c.SetParamValues(tc.PublishedName)
			m := mockPublishedUsecaseMiddleware(false)

			err := m(PublishedAuthMiddleware()(func(c echo.Context) error {
				return c.String(http.StatusOK, "test")
			}))(c)
			if tc.Error == nil {
				assert.NoError(err)
				assert.Equal(http.StatusOK, res.Code)
				assert.Equal("test", res.Body.String())
			} else {
				assert.ErrorIs(err, tc.Error)
			}
		})
	}
}

func TestPublishedData(t *testing.T) {
	tests := []struct {
		Name          string
		PublishedName string
		Error         error
	}{
		{
			Name:  "empty",
			Error: rerror.ErrNotFound,
		},
		{
			Name:          "not found",
			PublishedName: "pr",
			Error:         rerror.ErrNotFound,
		},
		{
			Name:          "ok",
			PublishedName: "prj",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			assert := assert.New(t)
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			res := httptest.NewRecorder()
			e := echo.New()
			c := e.NewContext(req, res)
			c.SetParamNames("name")
			c.SetParamValues(tc.PublishedName)
			m := mockPublishedUsecaseMiddleware(false)
			err := m(PublishedData("", true))(c)

			if tc.Error == nil {
				assert.NoError(err)
				assert.Equal(http.StatusOK, res.Code)
				assert.Equal("application/json", res.Header().Get(echo.HeaderContentType))
				assert.Equal("aaa", res.Body.String())
			} else {
				assert.ErrorIs(err, tc.Error)
			}
		})
	}
}

func TestPublishedIndex(t *testing.T) {
	tests := []struct {
		Name          string
		PublishedName string
		Error         error
		EmptyIndex    bool
	}{
		{
			Name:  "empty",
			Error: rerror.ErrNotFound,
		},
		{
			Name:       "empty index",
			Error:      rerror.ErrNotFound,
			EmptyIndex: true,
		},
		{
			Name:          "not found",
			PublishedName: "pr",
			Error:         rerror.ErrNotFound,
		},
		{
			Name:          "ok",
			PublishedName: "prj",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			assert := assert.New(t)
			req := httptest.NewRequest(http.MethodGet, "/aaa/bbb", nil)
			res := httptest.NewRecorder()
			e := echo.New()
			c := e.NewContext(req, res)
			c.SetParamNames("name")
			c.SetParamValues(tc.PublishedName)
			m := mockPublishedUsecaseMiddleware(tc.EmptyIndex)

			err := m(PublishedIndex("", true))(c)

			if tc.Error == nil {
				assert.NoError(err)
				assert.Equal(http.StatusOK, res.Code)
				assert.Equal("text/html; charset=UTF-8", res.Header().Get(echo.HeaderContentType))
				assert.Equal("index", res.Body.String())
			} else {
				assert.ErrorIs(err, tc.Error)
			}
		})
	}
}

func TestWebConfigHandler(t *testing.T) {
	strPtr := func(s string) *string { return &s }
	tests := []struct {
		name       string
		auth       *config.AuthConfig
		webCfg     map[string]any
		published  string
		want       map[string]any
		statusCode int
	}{
		{
			name: "with auth and published",
			auth: &config.AuthConfig{
				ISS:      "https://iss.example.com/",
				AUD:      []string{"https://aud.example.com"},
				ClientID: strPtr("client"),
			},
			webCfg: map[string]any{"a": "b"},
			want: map[string]any{
				"auth0Domain":   "https://iss.example.com",
				"auth0Audience": "https://aud.example.com",
				"auth0ClientId": "client",
				"published":     "https://{}.example.com",
				"a":             "b",
			},
			published:  "https://{}.example.com",
			statusCode: http.StatusOK,
		},
		{
			name: "web overrides auth fields and no published",
			auth: &config.AuthConfig{
				ISS:      "https://iss.example.com/",
				AUD:      []string{"https://aud.example.com"},
				ClientID: strPtr("client"),
			},
			webCfg: map[string]any{
				"auth0Domain": "override",
				"x":           "y",
			},
			want: map[string]any{
				"auth0Domain":   "override",
				"auth0Audience": "https://aud.example.com",
				"auth0ClientId": "client",
				"x":             "y",
			},
			statusCode: http.StatusOK,
		},
		{
			name:   "no auth and no published",
			webCfg: map[string]any{"a": "b"},
			want:   map[string]any{"a": "b"},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/reearth_config.json", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := WebConfigHandler(tt.auth, tt.webCfg, tt.published)(c)
			assert.NoError(t, err)
			if tt.statusCode != 0 {
				assert.Equal(t, tt.statusCode, rec.Code)
			} else {
				assert.Equal(t, http.StatusOK, rec.Code)
			}
			var got map[string]any
			assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &got))
			assert.Equal(t, tt.want, got)
		})
	}
}

func mockPublishedUsecaseMiddleware(emptyIndex bool) echo.MiddlewareFunc {
	return ContextMiddleware(func(ctx context.Context) context.Context {
		return adapter.AttachUsecases(ctx, &interfaces.Container{
			Published: &mockPublished{EmptyIndex: emptyIndex},
		})
	})
}

type mockPublished struct {
	interfaces.Published
	EmptyIndex bool
}

func (p *mockPublished) Metadata(ctx context.Context, name string) (interfaces.PublishedMetadata, error) {
	switch name {
	case "active":
		return interfaces.PublishedMetadata{
			IsBasicAuthActive: true,
			BasicAuthUsername: "fooo",
			BasicAuthPassword: "baar",
		}, nil
	case "inactive":
		return interfaces.PublishedMetadata{
			IsBasicAuthActive: false,
			BasicAuthUsername: "fooo",
			BasicAuthPassword: "baar",
		}, nil
	}
	return interfaces.PublishedMetadata{}, rerror.ErrNotFound
}

func (p *mockPublished) Data(ctx context.Context, name string) (io.Reader, error) {
	if name == "prj" {
		return strings.NewReader("aaa"), nil
	}
	return nil, rerror.ErrNotFound
}

func (p *mockPublished) Index(ctx context.Context, name string, url *url.URL) (string, error) {
	if p.EmptyIndex {
		return "", nil
	}
	if name == "prj" && url.String() == "http://example.com/aaa/bbb" {
		return "index", nil
	}
	return "", rerror.ErrNotFound
}

func TestGetAliasFromHost(t *testing.T) {
	assert.Equal(t, "", getAliasFromHost("", ".example.com")) // invalid regexp
	assert.Equal(t, "", getAliasFromHost("", "{}.example.com"))
	assert.Equal(t, "aaa", getAliasFromHost("aaa.example.com", "{}.example.com"))
	assert.Equal(t, "aaa", getAliasFromHost("aaa.example.com", "https://{}.example.com"))
	assert.Equal(t, "aaa", getAliasFromHost("aaa.example.com", "http://{}.example.com"))
	assert.Equal(t, "bbb.aaa", getAliasFromHost("bbb.aaa.example.com", "{}.example.com"))
}
