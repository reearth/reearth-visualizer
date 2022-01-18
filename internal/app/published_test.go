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
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/stretchr/testify/assert"
)

func TestPublishedAuthMiddleware(t *testing.T) {
	h := PublishedAuthMiddleware(func(ctx context.Context, name string) (interfaces.ProjectPublishedMetadata, error) {
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
	})(func(c echo.Context) error {
		return c.String(http.StatusOK, "test")
	})

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

			err := h(c)
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
	h := PublishedData(func(ctx context.Context, name string) (io.Reader, error) {
		if name == "prj" {
			return strings.NewReader("aaa"), nil
		}
		return nil, rerror.ErrNotFound
	})

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

			err := h(c)
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
			Error:      echo.ErrNotFound,
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

			err := PublishedIndex(func(ctx context.Context, name string, url *url.URL) (string, error) {
				if tc.EmptyIndex {
					return "", nil
				}
				if name == "prj" {
					assert.Equal("http://example.com/aaa/bbb", url.String())
					return "index", nil
				}
				return "", rerror.ErrNotFound
			})(c)

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
