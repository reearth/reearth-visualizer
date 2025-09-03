package app

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"path"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
)

func serveFiles(
	ec *echo.Echo,
	repo gateway.File,
) {
	if repo == nil {
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

	// Asset CORS middleware - allows all origins for asset endpoints
	assetCORSMiddleware := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("Access-Control-Allow-Origin", "*")
			c.Response().Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			c.Response().Header().Set("Access-Control-Allow-Headers", "*")
			c.Response().Header().Set("Access-Control-Max-Age", "86400")

			if c.Request().Method == "OPTIONS" {
				return c.NoContent(http.StatusNoContent)
			}

			return next(c)
		}
	}

	ec.GET(
		"/assets/:filename",
		fileHandler(func(ctx echo.Context) (io.Reader, string, error) {
			filename := ctx.Param("filename")
			r, err := repo.ReadAsset(ctx.Request().Context(), filename)
			return r, filename, err
		}),
		assetCORSMiddleware,
	)

	// Handle OPTIONS for assets endpoint
	ec.OPTIONS("/assets/:filename", assetCORSMiddleware(func(c echo.Context) error {
		return c.NoContent(http.StatusNoContent)
	}))

	ec.GET(
		"/export/:filename",
		fileHandler(func(ctx echo.Context) (io.Reader, string, error) {
			filename := ctx.Param("filename")

			r, err := repo.ReadExportProjectZip(ctx.Request().Context(), filename)
			if err != nil {
				return nil, "", err
			}
			fmt.Printf("download: %s \n", filename)

			go func() {
				// download and then delete
				time.Sleep(3 * time.Second)
				err := repo.RemoveExportProjectZip(ctx.Request().Context(), filename)
				if err != nil {
					fmt.Printf("delete err: %s \n", err.Error())
				} else {
					fmt.Printf("file deleted: %s \n", filename)
				}
			}()

			return r, filename, nil
		}),
	)

	ec.GET(
		"/plugins/:plugin/:filename",
		fileHandler(func(ctx echo.Context) (io.Reader, string, error) {
			pid, err := id.PluginIDFrom(ctx.Param("plugin"))
			if err != nil {
				return nil, "", rerror.ErrNotFound
			}
			filename := ctx.Param("filename")
			r, err := repo.ReadPluginFile(ctx.Request().Context(), pid, filename)
			return r, filename, err
		}),
	)

	ec.GET(
		"/published/:name",
		fileHandler(func(ctx echo.Context) (io.Reader, string, error) {
			name := ctx.Param("name")
			r, err := repo.ReadBuiltSceneFile(ctx.Request().Context(), name)
			return r, name + ".json", err
		}),
	)
}
