package app_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/app"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"golang.org/x/text/language"

	"github.com/stretchr/testify/assert"
)

func TestLanguageExtractor(t *testing.T) {
	// Mock user with a language
	tests := []struct {
		name       string
		headerLang string
		userLang   language.Tag
		expected   language.Tag
	}{
		{
			name:       "User language overrides browser language",
			headerLang: "fr",
			userLang:   language.English,
			expected:   language.English,
		},
		{
			name:       "No user language, use browser language",
			headerLang: "fr",
			userLang:   language.Und,
			expected:   language.French,
		},
		{
			name:       "No browser language or user language is und, fallback to default",
			headerLang: "",
			userLang:   language.Und,
			expected:   language.English,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Mock request and context
			req, _ := http.NewRequest("GET", "/", nil)
			req.Header.Set("lang", tt.headerLang)

			// Create new-style user
			metadata := accountsUser.NewMetadata()
			metadata.SetLang(tt.userLang)
			u, _ := accountsUser.New().
				ID(accountsID.NewUserID()).
				Workspace(accountsID.NewWorkspaceID()).
				Name("test").
				Email("test@example.com").
				Metadata(metadata).
				Build()
			ctx := adapter.AttachUser(context.Background(), u)
			req = req.WithContext(ctx)

			lang := app.LanguageExtractor(req)
			assert.Equal(t, tt.expected, lang)
		})
	}
}

func TestAttachLanguageMiddleware(t *testing.T) {
	e := echo.New()
	e.Use(app.AttachLanguageMiddleware)

	e.GET("/", func(c echo.Context) error {
		// get lang from context
		lang := adapter.Lang(c.Request().Context(), nil)
		// include lang in response
		return c.String(http.StatusOK, lang)
	})

	t.Run("Middleware attaches correct language", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("lang", "fr")
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
		// check lang in response
		assert.Equal(t, "fr", rec.Body.String())
	})
}
