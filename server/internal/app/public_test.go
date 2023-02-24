package app

import (
	"context"
	"encoding/base64"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
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

func (p *mockPublished) Metadata(ctx context.Context, name string) (interfaces.ProjectPublishedMetadata, error) {
	if name == "active" {
		return interfaces.ProjectPublishedMetadata{
			IsBasicAuthActive: true,
			BasicAuthUsername: "fooo",
			BasicAuthPassword: "baar",
		}, nil
	} else if name == "inactive" {
		return interfaces.ProjectPublishedMetadata{
			IsBasicAuthActive: false,
			BasicAuthUsername: "fooo",
			BasicAuthPassword: "baar",
		}, nil
	}
	return interfaces.ProjectPublishedMetadata{}, rerror.ErrNotFound
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
