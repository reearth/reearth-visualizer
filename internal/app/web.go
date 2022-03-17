package app

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type WebConfig map[string]string

func web(e *echo.Echo, wc WebConfig, a []AuthConfig) {
	if _, err := os.Stat("web"); err != nil {
		return // web won't be delivered
	}

	e.Logger.Info("web: web directory will be delivered\n")

	config := map[string]string{}
	if len(a) > 0 {
		ac := a[0]
		if ac.ISS != "" {
			config["auth0Domain"] = ac.ISS
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

	e.GET("/reearth_config.json", func(c echo.Context) error {
		return c.JSON(http.StatusOK, config)
	})

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:   "web",
		Index:  "index.html",
		Browse: false,
		HTML5:  true,
	}))
}
