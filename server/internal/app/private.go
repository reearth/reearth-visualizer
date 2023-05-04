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

func ExportDataset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		u := adapter.Usecases(ctx)

		param := c.Param("datasetSchemaId")

		dssId, err := id.DatasetSchemaIDFrom(param)
		if err != nil {
			return rerror.ErrNotFound
		}

		r, name, err := u.Dataset.Export(ctx, dssId, nil)
		if err != nil {
			return err
		}

		c.Response().Header().Add("Content-Disposition", "attachment;filename="+name)
		return c.Stream(http.StatusOK, "text/csv", r)
	}
}
