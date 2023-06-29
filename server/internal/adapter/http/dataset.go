package http

import (
	"net/http"
	"path"
	"strings"

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
		ext := path.Ext(param)
		name := param[:len(param)-len(ext)]
		if ext == "" {
			ext = ".csv"
		}

		dsid, err := id.DatasetSchemaIDFrom(name)
		if err != nil {
			return rerror.ErrNotFound
		}

		res := c.Response()

		if err := u.Dataset.Export(ctx, dsid, strings.TrimPrefix(ext, "."), res, func(name, contentType string) {
			res.Header().Set(echo.HeaderContentType, contentType)
			res.Header().Set("Content-Disposition", "attachment;filename="+name)
			res.WriteHeader(http.StatusOK)
		}); err != nil {
			return err
		}
		res.Flush()
		return nil
	}
}
