package app

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearthx/log"
	"github.com/spf13/afero"
)

type WebHandler struct {
	Disabled    bool
	AppDisabled bool
	WebConfig   map[string]any
	AuthConfig  *config.AuthConfig
	HostPattern string
	Title       string
	FaviconURL  string
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

	// favicon
	var favicon []byte
	var faviconPath string
	var err error
	if w.FaviconURL != "" {
		favicon, err = fetchFavicon(w.FaviconURL)
		if err != nil {
			log.Errorf("web: failed to fetch favicon from %s", w.FaviconURL)
			return
		}
		faviconPath = "/favicon.ico"
	}

	// fs
	hfs, err := NewRewriteHTMLFS(w.FS, "web", w.Title, faviconPath)
	if err != nil {
		log.Errorf("web: failed to init fs: %v", err)
		return
	}

	log.Infof("web: web directory will be delivered")

	cfg := map[string]any{}
	if w.AuthConfig != nil {
		if w.AuthConfig.ISS != "" {
			cfg["auth0Domain"] = strings.TrimSuffix(w.AuthConfig.ISS, "/")
		}
		if w.AuthConfig.ClientID != nil {
			cfg["auth0ClientId"] = *w.AuthConfig.ClientID
		}
		if len(w.AuthConfig.AUD) > 0 {
			cfg["auth0Audience"] = w.AuthConfig.AUD[0]
		}
	}
	if w.HostPattern != "" {
		cfg["published"] = w.hostWithSchema()
	}

	for k, v := range w.WebConfig {
		cfg[k] = v
	}

	static := middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       "web",
		Index:      "index.html",
		Browse:     false,
		HTML5:      true,
		Filesystem: hfs,
	})
	notFound := func(c echo.Context) error { return echo.ErrNotFound }

	e.GET("/reearth_config.json", func(c echo.Context) error {
		return c.JSON(http.StatusOK, cfg)
	})
	e.GET("/data.json", PublishedData(w.HostPattern, false))
	if favicon != nil && faviconPath != "" {
		e.GET(faviconPath, func(c echo.Context) error {
			return c.Blob(http.StatusOK, "image/vnd.microsoft.icon", favicon)
		})
	}
	e.GET("/index.html", func(c echo.Context) error {
		return c.Redirect(http.StatusPermanentRedirect, "/")
	})
	e.GET("/", notFound, PublishedIndexMiddleware(w.HostPattern, false, w.AppDisabled), static)
	e.GET("*", notFound, static)
}

func (w *WebHandler) hostWithSchema() string {
	if strings.HasPrefix(w.HostPattern, "http://") || strings.HasPrefix(w.HostPattern, "https://") {
		return w.HostPattern
	}
	return "https://" + w.HostPattern
}
