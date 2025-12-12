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

func (w *WebHandler) Handler(ec *echo.Echo) {

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

	publishedHost := ""
	if w.HostPattern != "" {
		publishedHost = w.hostWithSchema()
	}

	log.Infof("web: web directory will be delivered")

	static := middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       "web",
		Index:      "index.html",
		Browse:     false,
		HTML5:      true,
		Filesystem: hfs,
	})
	notFound := func(c echo.Context) error { return echo.ErrNotFound }

	if favicon != nil && faviconPath != "" {
		ec.GET(faviconPath, func(c echo.Context) error {
			return c.Blob(http.StatusOK, "image/vnd.microsoft.icon", favicon)
		})
	}

	ec.GET("/reearth_config.json", WebConfigHandler(w.AuthConfig, w.WebConfig, publishedHost))

	ec.GET("/data.json", PublishedData(w.HostPattern, false))               // for prod / dev
	ec.GET("/api/published_data/:name", PublishedData(w.HostPattern, true)) // for oss / localhost

	ec.GET("/api/published/:name", PublishedMetadata())

	// BasicAuth endpoint
	publishedGroup := ec.Group("/p", PublishedAuthMiddleware())
	publishedGroup.GET("/:name/data.json", PublishedData(w.HostPattern, true))
	publishedGroup.GET("/:name/", PublishedIndex(w.HostPattern, true))

	ec.GET("/index.html", func(c echo.Context) error {
		return c.Redirect(http.StatusPermanentRedirect, "/")
	})
	ec.GET("/", notFound, PublishedIndexMiddleware(w.HostPattern, false, w.AppDisabled), static)
	ec.GET("*", notFound, static)
}

func (w *WebHandler) hostWithSchema() string {
	if strings.HasPrefix(w.HostPattern, "http://") || strings.HasPrefix(w.HostPattern, "https://") {
		return w.HostPattern
	}
	return "https://" + w.HostPattern
}
