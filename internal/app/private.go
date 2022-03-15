package app

import (
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-backend/internal/adapter"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer/encoding"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

// TODO: move to adapter and usecase layer

var (
	ErrOpDenied     = errors.New("operation denied")
	ErrUnauthorized = errors.New("Unauthorized")
	ErrUnknowFormat = errors.New("unknown file format")
	ErrBadID        = errors.New("bad id")
	ErrBadParameter = errors.New("id.ext is needed")
)

func getEncoder(w io.Writer, ext string) (encoding.Encoder, string) {
	switch strings.ToLower(ext) {
	case "kml":
		return encoding.NewKMLEncoder(w), "application/xml"
	case "geojson":
		return encoding.NewGeoJSONEncoder(w), "application/json"
	case "czml":
		return encoding.NewCZMLEncoder(w), "application/json"
	case "shp":
		return encoding.NewSHPEncoder(w), "application/octet-stream"
	}
	return nil, ""
}

func privateAPI(
	ec *echo.Echo,
	r *echo.Group,
	repos *repo.Container,
) {
	r.GET("/layers/:param", func(c echo.Context) error {
		ctx := c.Request().Context()
		user := adapter.User(c.Request().Context())
		if user == nil {
			return &echo.HTTPError{Code: http.StatusUnauthorized, Message: ErrUnauthorized}
		}

		op := adapter.Operator(c.Request().Context())
		if op == nil {
			return &echo.HTTPError{Code: http.StatusUnauthorized, Message: ErrOpDenied}
		}
		repos := repos.Filtered(repo.TeamFilterFromOperator(op), repo.SceneFilterFromOperator(op))

		param := c.Param("param")
		params := strings.Split(param, ".")
		if len(params) != 2 {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: ErrBadParameter}
		}

		lid, err := id.LayerIDFrom(params[0])
		if err != nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: ErrBadID}
		}

		layer, err := repos.Layer.FindByID(ctx, lid)
		if err != nil {
			if errors.Is(rerror.ErrNotFound, err) {
				return &echo.HTTPError{Code: http.StatusNotFound, Message: err}
			}
			return &echo.HTTPError{Code: http.StatusInternalServerError, Message: err}
		}
		if !op.IsReadableScene(layer.Scene()) {
			return &echo.HTTPError{Code: http.StatusUnauthorized, Message: ErrOpDenied}
		}
		ext := params[1]

		reader, writer := io.Pipe()
		e, mime := getEncoder(writer, strings.ToLower(ext))
		if e == nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: ErrUnknowFormat}
		}

		ex := &encoding.Exporter{
			Merger: &merging.Merger{
				LayerLoader:    repo.LayerLoaderFrom(repos.Layer),
				PropertyLoader: repo.PropertyLoaderFrom(repos.Property),
			},
			Sealer: &merging.Sealer{
				DatasetGraphLoader: repo.DatasetGraphLoaderFrom(repos.Dataset),
			},
			Encoder: e,
		}

		go func() {
			defer func() {
				_ = writer.Close()
			}()
			err = ex.ExportLayerByID(ctx, lid)
		}()

		if err != nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: err}
		}
		return c.Stream(http.StatusOK, mime, reader)
	})
}
