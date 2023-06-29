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
		WithHeader("X-Reearth-Debug-User", uId.String()).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/datasets/{}", dataset.NewID()).
		WithHeader("X-Reearth-Debug-User", uId.String()).
		Expect().
		Status(http.StatusNotFound)

	res := e.GET("/api/datasets/{}", dssId).
		WithHeader("X-Reearth-Debug-User", uId.String()).
		Expect().
		Status(http.StatusOK).
		ContentType("text/csv")
	res.Header("Content-Disposition").Equal("attachment;filename=test.csv")
	res.Body().Equal("f1,f2,f3,location_lng,location_lat\ntest,123,true,12.000000,11.000000\n")

	res = e.GET("/api/datasets/{}.csv", dssId).
		WithHeader("X-Reearth-Debug-User", uId.String()).
		Expect().
		Status(http.StatusOK).
		ContentType("text/csv")
	res.Header("Content-Disposition").Equal("attachment;filename=test.csv")
	res.Body().Equal("f1,f2,f3,location_lng,location_lat\ntest,123,true,12.000000,11.000000\n")

	res = e.GET("/api/datasets/{}.json", dssId).
		WithHeader("X-Reearth-Debug-User", uId.String()).
		Expect().
		Status(http.StatusOK).
		ContentType("application/json")
	res.Header("Content-Disposition").Equal("attachment;filename=test.csv.json")
	res.Body().Equal("[{\"f1\":\"test\",\"f2\":123,\"f3\":true,\"location\":{\"lat\":11,\"lng\":12}}]\n")
}
