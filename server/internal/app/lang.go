package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"golang.org/x/text/language"
)

// LanguageExtractor extracts the appropriate language from the request.
func LanguageExtractor(req *http.Request) language.Tag {
	// Extract browser language from header
	lang := req.Header.Get("lang")

	// Extract user language from the adapter
	// if user language is not "und", use user language
	// if user language is "und", use browser language
	u := adapter.User(req.Context())
	if u != nil && !u.Lang().IsRoot() {
		lang = u.Lang().String()
	}

	tag, err := language.Parse(lang)
	if err != nil {
		return language.English
	}

	return tag
}

// AttachLanguageMiddleware attaches the detected language to the request context.
func AttachLanguageMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		lang := LanguageExtractor(c.Request())
		ctx := adapter.AttachLang(c.Request().Context(), lang)
		c.SetRequest(c.Request().WithContext(ctx))
		return next(c)
	}
}
