package app

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/spf13/afero"
)

type WebConfig map[string]string

type WebHandler struct {
	Disabled    bool
	AppDisabled bool
	WebConfig   WebConfig
	AuthConfig  *AuthConfig
	HostPattern string
	FS          afero.Fs
}

func (w *WebHandler) Handler(e *echo.Echo) {
	if w.Disabled {
		return
	}

	if w.FS == nil {
		w.FS = afero.NewOsFs()
	}
	if _, err := w.FS.Stat("web"); err != nil {
		return // web won't be delivered
	}

	e.Logger.Info("web: web directory will be delivered\n")

	config := map[string]string{}
	if w.AuthConfig != nil {
		if w.AuthConfig.ISS != "" {
			config["auth0Domain"] = strings.TrimSuffix(w.AuthConfig.ISS, "/")
		}
		if w.AuthConfig.ClientID != nil {
			config["auth0ClientId"] = *w.AuthConfig.ClientID
		}
		if len(w.AuthConfig.AUD) > 0 {
			config["auth0Audience"] = w.AuthConfig.AUD[0]
		}
	}
	if w.HostPattern != "" {
		config["published"] = w.HostPattern
	}

	for k, v := range w.WebConfig {
		config[k] = v
	}

	m := middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       "web",
		Index:      "index.html",
		Browse:     false,
		HTML5:      true,
		Filesystem: afero.NewHttpFs(w.FS),
	})
	notFound := func(c echo.Context) error { return echo.ErrNotFound }

	e.GET("/reearth_config.json", func(c echo.Context) error {
		return c.JSON(http.StatusOK, config)
	})
	e.GET("/data.json", PublishedData(w.HostPattern, false))
	e.GET("/index.html", func(c echo.Context) error {
		return c.Redirect(http.StatusPermanentRedirect, "/")
	})
	e.GET("/", notFound, PublishedIndexMiddleware(w.HostPattern, false, w.AppDisabled), m)
	e.GET("*", notFound, m)
}
