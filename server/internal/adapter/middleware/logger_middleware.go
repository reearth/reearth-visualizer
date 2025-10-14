package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

var gql struct {
	Query string `json:"query"`
}

func LoggerMiddleware() func(echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			res := c.Response()
			start := time.Now()

			bodyBytes, _ := io.ReadAll(req.Body)
			req.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
			_ = json.Unmarshal(bodyBytes, &gql)

			reqid := log.GetReqestID(res, req)
			args := []any{
				"time_unix", start.Unix(),
				"remote_ip", c.RealIP(),
				"host", req.Host,
				"body", gql,
				"form", req.Form,
				"uri", req.RequestURI,
				"method", req.Method,
				"path", req.URL.Path,
				"protocol", req.Proto,
				"referer", req.Referer(),
				"user_agent", req.UserAgent(),
				"bytes_in", req.ContentLength,
				"request_id", reqid,
				"route", c.Path(),
			}

			logger := log.GetLoggerFromContextOrDefault(c.Request().Context())
			logger = logger.WithCaller(false)

			// incoming log
			logger.Infow(fmt.Sprintf("<-- %s %s", req.Method, req.URL.Path), args...)

			if err := next(c); err != nil {
				c.Error(err)
			}

			res = c.Response()
			stop := time.Now()
			latency := stop.Sub(start)
			latencyHuman := latency.String()
			args = append(args, "status", res.Status, "bytes_out", res.Size, "letency", latency.Microseconds(), "latency_human", latencyHuman)

			// outcoming log
			logger.Infow(fmt.Sprintf("--> %s %d %s %s", req.Method, res.Status, req.URL.Path, latencyHuman), args...)

			return nil
		}
	}
}
