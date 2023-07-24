package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/pkg/dataset"
)

func TestDatasetExport(t *testing.T) {
	e := StartServer(t, &config.Config{
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	e.GET("/api/datasets/test").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/datasets/test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/datasets/{}", dataset.NewID()).
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().
		Status(http.StatusNotFound)

	res := e.GET("/api/datasets/{}", dssID).
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().
		Status(http.StatusOK).
		ContentType("text/csv")
	res.Header("Content-Disposition").Equal("attachment;filename=test.csv")
	res.Body().Equal(",f1,f2,f3,location_lng,location_lat\n" + dsID.String() + ",test,123,true,12.000000,11.000000\n")

	res = e.GET("/api/datasets/{}.csv", dssID).
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().
		Status(http.StatusOK).
		ContentType("text/csv")
	res.Header("Content-Disposition").Equal("attachment;filename=test.csv")
	res.Body().Equal(",f1,f2,f3,location_lng,location_lat\n" + dsID.String() + ",test,123,true,12.000000,11.000000\n")

	res = e.GET("/api/datasets/{}.json", dssID).
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().
		Status(http.StatusOK).
		ContentType("application/json")
	res.Header("Content-Disposition").Equal("attachment;filename=test.csv.json")

	res.JSON().Equal(map[string]any{
		"schema": map[string]any{
			"$schema": "http://json-schema.org/draft-07/schema#",
			"$id":     "#/schemas/" + dssID.String(),
			"title":   "test.csv",
			"type":    "object",
			"properties": map[string]any{
				"": map[string]any{
					"title": "ID",
					"$id":   "#/properties/id",
					"type":  "string",
				},
				"f1": map[string]any{
					"$id":  "#/properties/" + dsfID1.String(),
					"type": "string",
				},
				"f2": map[string]any{
					"$id":  "#/properties/" + dsfID2.String(),
					"type": "number",
				},
				"f3": map[string]any{
					"$id":  "#/properties/" + dsfID3.String(),
					"type": "boolean",
				},
				"location": map[string]any{
					"$id":   "#/properties/" + dsfID4.String(),
					"type":  "object",
					"title": "LatLng",
					"required": []string{
						"lat",
						"lng",
					},
					"properties": map[string]any{
						"lat": map[string]any{
							"type": "number",
						},
						"lng": map[string]any{
							"type": "number",
						},
					},
				},
			},
		},
		"datasets": []map[string]any{
			{
				"":   dsID.String(),
				"f1": "test",
				"f2": 123,
				"f3": true,
				"location": map[string]any{
					"lat": 11.0,
					"lng": 12.0,
				},
			},
		},
	})
}
