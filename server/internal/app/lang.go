package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"golang.org/x/text/language"
)

func LanguageExtractor(req *http.Request) language.Tag {
	lang := req.Header.Get("lang")

	u := adapter.User(req.Context())

	if u != nil && u.Metadata() != nil && !u.Metadata().Lang().IsRoot() {
		lang = u.Metadata().Lang().String()
	}

	tag, err := language.Parse(lang)
	if err != nil {
		return language.English
	}

	return tag
}

func AttachLanguageMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		lang := LanguageExtractor(c.Request())
		ctx := adapter.AttachLang(c.Request().Context(), lang)
		c.SetRequest(c.Request().WithContext(ctx))
		return next(c)
	}
}
