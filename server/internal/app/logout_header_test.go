package app_test

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/app"
	"github.com/stretchr/testify/assert"
)

func TestLatestLogoutAtHeader(t *testing.T) {
	t.Run("header is set when user has latestLogoutAt", func(t *testing.T) {
		e := echo.New()
		e.Use(app.LatestLogoutAtHeader)
		e.GET("/", func(c echo.Context) error {
			return c.String(http.StatusOK, "ok")
		})

		logoutTime := time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC)
		u := accountsUser.New().NewID().
			Name("test").Email("test@example.com").
			Workspace(accountsID.NewWorkspaceID()).
			MustBuild()
		u.SetLatestLogoutAt(logoutTime)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		ctx := adapter.AttachUser(context.Background(), u)
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, fmt.Sprintf("%d", logoutTime.Unix()), rec.Header().Get("X-Latest-Logout-At"))
	})

	t.Run("header is absent when user has no latestLogoutAt", func(t *testing.T) {
		e := echo.New()
		e.Use(app.LatestLogoutAtHeader)
		e.GET("/", func(c echo.Context) error {
			return c.String(http.StatusOK, "ok")
		})

		u := accountsUser.New().NewID().
			Name("test").Email("test@example.com").
			Workspace(accountsID.NewWorkspaceID()).
			MustBuild()

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		ctx := adapter.AttachUser(context.Background(), u)
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Empty(t, rec.Header().Get("X-Latest-Logout-At"))
	})

	t.Run("header is absent when no user in context", func(t *testing.T) {
		e := echo.New()
		e.Use(app.LatestLogoutAtHeader)
		e.GET("/", func(c echo.Context) error {
			return c.String(http.StatusOK, "ok")
		})

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()

		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Empty(t, rec.Header().Get("X-Latest-Logout-At"))
	})
}
