package app

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/rerror"
)

func ExportLayer() echo.HandlerFunc {
	return func(c echo.Context) error {

		param := c.Param("param")
		params := strings.Split(param, ".")
		if len(params) != 2 {
			return rerror.ErrNotFound
		}

		return c.NoContent(http.StatusOK)
	}
}
