package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
)

func ExportDataset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		u := adapter.Usecases(ctx)

		param := c.Param("datasetSchemaId")

		dssId, err := id.DatasetSchemaIDFrom(param)
		if err != nil {
			return rerror.ErrNotFound
		}

		r, name, err := u.Dataset.Export(ctx, dssId, "csv", nil)
		if err != nil {
			return err
		}

		c.Response().Header().Add("Content-Disposition", "attachment;filename="+name)
		return c.Stream(http.StatusOK, "text/csv", r)
	}
}
