package app

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/spf13/afero"
)

type WebConfig map[string]string

func web(e *echo.Echo, wc WebConfig, ac *AuthConfig, pattern string, fs afero.Fs) {
	if fs == nil {
		fs = afero.NewOsFs()
	}
	if _, err := fs.Stat("web"); err != nil {
		return // web won't be delivered
	}

	e.Logger.Info("web: web directory will be delivered\n")

	config := map[string]string{}
	if ac != nil {
		if ac.ISS != "" {
			config["auth0Domain"] = strings.TrimSuffix(ac.ISS, "/")
		}
		if ac.ClientID != nil {
			config["auth0ClientId"] = *ac.ClientID
		}
		if len(ac.AUD) > 0 {
			config["auth0Audience"] = ac.AUD[0]
		}
	}

	for k, v := range wc {
		config[k] = v
	}

	m := middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       "web",
		Index:      "index.html",
		Browse:     false,
		HTML5:      true,
		Filesystem: afero.NewHttpFs(fs),
	})
	notFound := func(c echo.Context) error { return echo.ErrNotFound }

	e.GET("/reearth_config.json", func(c echo.Context) error {
		return c.JSON(http.StatusOK, config)
	})
	e.GET("/data.json", PublishedData(pattern, false))
	e.GET("/index.html", func(c echo.Context) error {
		return c.Redirect(http.StatusPermanentRedirect, "/")
	})
	e.GET("/", notFound, PublishedIndexMiddleware(pattern, false), m)
	e.GET("*", notFound, m)
}
