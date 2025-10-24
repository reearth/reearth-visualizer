package middleware

import (
	"net/http"

	echo "github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

func RestAPITracingMiddleware() echo.MiddlewareFunc {
	tracer := otel.Tracer("reearth-visualizer")

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			routePath := c.Path()
			actualPath := req.URL.Path
			path := routePath
			if path == "" {
				path = actualPath
			}
			if req.Method == "OPTIONS" || actualPath == "/favicon.ico" {
				return next(c)
			}

			spanName := req.Method + " " + path
			ctx, span := tracer.Start(ctx, spanName,
				trace.WithSpanKind(trace.SpanKindServer),
				trace.WithAttributes(
					attribute.String("component", "rest"),
					attribute.String("http.route", path),
					attribute.String("http.path", actualPath),
					attribute.String("http.method", req.Method),
					attribute.String("http.url", req.URL.Path),
					attribute.String("http.host", req.Host),
					attribute.String("http.scheme", req.URL.Scheme),
				),
			)
			defer span.End()

			if query := req.URL.Query(); len(query) > 0 {
				queryCount := 0
				for key := range query {
					span.SetAttributes(attribute.String("http.query."+key, "present"))
					queryCount++
				}
				span.SetAttributes(attribute.Int("http.query.count", queryCount))
			}

			paramNames := c.ParamNames()
			if len(paramNames) > 0 {
				for _, paramName := range paramNames {
					paramValue := c.Param(paramName)
					if paramValue != "" {
						span.SetAttributes(attribute.String("http.param."+paramName, paramValue))
					}
				}
			}

			c.SetRequest(req.WithContext(ctx))

			err := next(c)

			status := c.Response().Status
			if status == 0 {
				status = 200
			}

			span.SetAttributes(
				attribute.Int("http.status_code", status),
				attribute.Int64("http.response.size", c.Response().Size),
			)

			if err != nil {
				span.RecordError(err)
				span.SetStatus(codes.Error, err.Error())
				log.Warnfc(ctx, "rest: %s %s failed with error: %v", req.Method, path, err)
			} else if status >= 400 {
				span.SetStatus(codes.Error, http.StatusText(status))
				log.Warnfc(ctx, "rest: %s %s returned status %d", req.Method, path, status)
			} else {
				span.SetStatus(codes.Ok, "Request completed successfully")
				log.Infofc(ctx, "rest: %s %s completed successfully (status=%d)", req.Method, path, status)
			}

			return err
		}
	}
}
