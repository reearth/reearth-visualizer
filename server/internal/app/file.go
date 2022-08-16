package app

import (
	"io"
	"mime"
	"net/http"
	"path"

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
			r, err := repo.ReadAsset(ctx.Request().Context(), filename)
			return r, filename, err
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
