package app

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
)

func ExportLayer() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		u := adapter.Usecases(ctx)

		param := c.Param("param")
		params := strings.Split(param, ".")
		if len(params) != 2 {
			return rerror.ErrNotFound
		}

		lid, err := id.LayerIDFrom(params[0])
		if err != nil {
			return rerror.ErrNotFound
		}

		reader, mime, err := u.Layer.Export(ctx, lid, params[1])
		if err != nil {
			return err
		}

		return c.Stream(http.StatusOK, mime, reader)
	}
}
