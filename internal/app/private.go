package app

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-backend/internal/graphql"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer/encoding"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/user"
)

// TODO: move to adapter and usecase layer

var (
	ErrOpDenied     = errors.New("operation denied")
	ErrUnauthorized = errors.New("Unauthorized")
	ErrUnknowFormat = errors.New("unknown file format")
	ErrBadID        = errors.New("bad id")
	ErrBadParameter = errors.New("id.ext is needed")
)

func checkScene(ctx context.Context, id id.SceneID, op *usecase.Operator, sr repo.Scene) error {
	res, err := sr.HasSceneTeam(ctx, id, op.ReadableTeams)
	if err != nil {
		return err
	}
	if !res {
		return ErrOpDenied
	}
	return nil
}

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
		user := c.Request().Context().Value(graphql.ContextUser).(*user.User)
		if user == nil {
			return &echo.HTTPError{Code: http.StatusUnauthorized, Message: ErrUnauthorized}
		}
		op := c.Request().Context().Value(graphql.ContextOperator).(*usecase.Operator)
		if op == nil {
			return &echo.HTTPError{Code: http.StatusUnauthorized, Message: ErrOpDenied}
		}
		param := c.Param("param")
		params := strings.Split(param, ".")
		if len(params) != 2 {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: ErrBadParameter}
		}

		lid, err := id.LayerIDFrom(params[0])
		if err != nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: ErrBadID}
		}
		scenes, err := repos.Scene.FindIDsByTeam(ctx, op.ReadableTeams)
		if err != nil {
			if errors.Is(rerror.ErrNotFound, err) {
				return &echo.HTTPError{Code: http.StatusNotFound, Message: err}
			}
			return &echo.HTTPError{Code: http.StatusInternalServerError, Message: err}
		}
		layer, err := repos.Layer.FindByID(ctx, lid, scenes)
		if err != nil {
			if errors.Is(rerror.ErrNotFound, err) {
				return &echo.HTTPError{Code: http.StatusNotFound, Message: err}
			}
			return &echo.HTTPError{Code: http.StatusInternalServerError, Message: err}
		}
		err = checkScene(ctx, layer.Scene(), op, repos.Scene)
		if err != nil {
			if errors.Is(ErrOpDenied, err) {
				return &echo.HTTPError{Code: http.StatusUnauthorized, Message: ErrOpDenied}
			}

			return &echo.HTTPError{Code: http.StatusInternalServerError, Message: err}
		}
		ext := params[1]

		reader, writer := io.Pipe()
		e, mime := getEncoder(writer, strings.ToLower(ext))
		if e == nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: ErrUnknowFormat}
		}

		ex := &encoding.Exporter{
			Merger: &merging.Merger{
				LayerLoader:    repo.LayerLoaderFrom(repos.Layer, scenes),
				PropertyLoader: repo.PropertyLoaderFrom(repos.Property, scenes),
			},
			Sealer: &merging.Sealer{
				DatasetGraphLoader: repo.DatasetGraphLoaderFrom(repos.Dataset, scenes),
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
