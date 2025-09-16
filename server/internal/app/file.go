package app

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"path"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/app/internal/middleware"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
)

func serveFiles(
	ec *echo.Echo,
	allowedOrigins []string,
	domainChecker gateway.DomainChecker,
	fileGateway gateway.File,
) {
	if fileGateway == nil {
		return
	}

	fileHandler := func(handler func(echo.Context) (io.Reader, string, error)) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			reader, filename, err := handler(ctx)
			if err != nil {
				fmt.Printf("file handler err: %s\n", err.Error())
				return err
			}
			ct := "application/octet-stream"
			if ext := path.Ext(filename); ext != "" {
				ct2 := mime.TypeByExtension(ext)
				if ct2 != "" {
					ct = ct2
				}
			}
			return ctx.Stream(http.StatusOK, ct, reader)
		}
	}

	ec.GET(
		"/assets/:filename",
		fileHandler(func(ctx echo.Context) (io.Reader, string, error) {
			filename := ctx.Param("filename")
			r, err := fileGateway.ReadAsset(ctx.Request().Context(), filename)
			return r, filename, err
		}),
		middleware.FilesCORSMiddleware(domainChecker, allowedOrigins),
	)

	// Handle OPTIONS for assets endpoint
	ec.OPTIONS("/assets/:filename",
		func(c echo.Context) error {
			return c.NoContent(http.StatusNoContent)
		},
		middleware.FilesCORSMiddleware(domainChecker, allowedOrigins),
	)

	ec.GET(
		"/export/:filename",
		fileHandler(func(ctx echo.Context) (io.Reader, string, error) {
			filename := ctx.Param("filename")

			r, err := fileGateway.ReadExportProjectZip(ctx.Request().Context(), filename)
			if err != nil {
				fmt.Printf("[export] !!!! download error: %s \n", filename)
				return nil, filename, err
			}
			fmt.Printf("[export] download file: %s \n", filename)

			rctx := ctx.Request().Context()

			go func() {
				// download and then delete
				time.Sleep(3 * time.Second)
				err := fileGateway.RemoveExportProjectZip(rctx, filename)
				if err != nil {
					fmt.Printf("[export] !!!! delete err: %s \n", err.Error())
				} else {
					fmt.Printf("[export] file deleted: %s \n", filename)
				}
			}()
			return r, filename, nil
		}),
		middleware.FilesCORSMiddleware(domainChecker, allowedOrigins),
	)

	ec.GET(
		"/plugins/:plugin/:filename",
		fileHandler(func(ctx echo.Context) (io.Reader, string, error) {
			pid, err := id.PluginIDFrom(ctx.Param("plugin"))
			if err != nil {
				return nil, "", rerror.ErrNotFound
			}
			filename := ctx.Param("filename")
			r, err := fileGateway.ReadPluginFile(ctx.Request().Context(), pid, filename)
			return r, filename, err
		}),
		middleware.FilesCORSMiddleware(domainChecker, allowedOrigins),
	)

	ec.GET(
		"/published/:name",
		fileHandler(func(ctx echo.Context) (io.Reader, string, error) {
			name := ctx.Param("name")
			r, err := fileGateway.ReadBuiltSceneFile(ctx.Request().Context(), name)
			return r, name + ".json", err
		}),
		middleware.FilesCORSMiddleware(domainChecker, allowedOrigins),
	)
}
