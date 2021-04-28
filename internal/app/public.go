package app

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	http1 "github.com/reearth/reearth-backend/internal/adapter/http"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interactor"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/dataset"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
)

type inputJSON struct {
	DatasetSchemaID string   `json:"datasetSchemaId"`
	Author          string   `json:"author"`
	Content         string   `json:"content"`
	Target          *string  `json:"target"`
	Lat             *float64 `json:"lat"`
	Lng             *float64 `json:"lng"`
}

func toResponseValue(v *dataset.Value) interface{} {
	if v == nil {
		return nil
	}
	switch v2 := v.Value().(type) {
	case float64:
		return v2
	case string:
		return v2
	case dataset.LatLng:
		return map[string]float64{
			"lat": v2.Lat,
			"lng": v2.Lng,
		}
	}
	return nil
}

func publicRoute(
	ec *echo.Echo,
	r *echo.Group,
	conf *Config,
	repos *repo.Container,
	gateways *gateway.Container,
) {
	controller := http1.NewUserController(interactor.NewUser(repos, gateways, conf.SignupSecret))

	// TODO: move to adapter and usecase layer
	r.POST("/comments", func(c echo.Context) error {
		var inp inputJSON
		if err := c.Bind(&inp); err != nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: err}
		}

		dssid, err := id.DatasetSchemaIDFrom(inp.DatasetSchemaID)
		if err != nil {
			return &echo.HTTPError{Code: http.StatusNotFound, Message: err1.ErrNotFound}
		}
		if inp.Author == "" {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: errors.New("require author value")}
		}
		if inp.Content == "" {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: errors.New("require content value")}
		}
		interactor := interactor.NewDataset(repos, gateways)
		dss, ds, err := interactor.AddDynamicDataset(c.Request().Context(), interfaces.AddDynamicDatasetParam{
			SchemaId: dssid,
			Author:   inp.Author,
			Content:  inp.Content,
			Lat:      inp.Lat,
			Lng:      inp.Lng,
			Target:   inp.Target,
		})

		if err != nil {
			if errors.Is(err1.ErrNotFound, err) {
				return &echo.HTTPError{Code: http.StatusNotFound, Message: err}
			}
			return &echo.HTTPError{Code: http.StatusInternalServerError, Message: err}
		}
		response := make(map[string]interface{})
		response["id"] = ds.ID().String()
		for _, f := range dss.Fields() {
			response[f.Name()] = toResponseValue(ds.Field(f.ID()).Value())
		}
		return c.JSON(http.StatusOK, response)
	})

	r.POST("/signup", func(c echo.Context) error {
		var inp http1.CreateUserInput
		if err := c.Bind(&inp); err != nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: fmt.Errorf("failed to parse request body: %w", err)}
		}

		output, err := controller.CreateUser(c.Request().Context(), inp)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, output)
	})
}
