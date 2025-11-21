package otel

import (
	"slices"
	"strings"

	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
)

var skipPaths = []string{"/", "/api/ping"}

func openTelemetrySkipper(c echo.Context) bool {
	if slices.Contains(skipPaths, c.Path()) {
		return true
	}

	ua := c.Request().UserAgent()
	return strings.Contains(ua, "GoogleStackdriverMonitoring")
}

// Middleware returns an Echo middleware that adds OpenTelemetry tracing
func Middleware(serviceName string) echo.MiddlewareFunc {
	return otelecho.Middleware(serviceName, otelecho.WithSkipper(openTelemetrySkipper))
}
