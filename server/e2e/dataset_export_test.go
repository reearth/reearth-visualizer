package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/pkg/dataset"
)

func TestDatasetExport(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	e.GET("/api/datasets/test").
		WithHeader("Origin", "https://example.com").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/datasets/test").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId.String()).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/datasets/"+dataset.NewID().String()).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId.String()).
		Expect().
		Status(http.StatusNotFound)

	res := e.GET("/api/datasets/"+dssId.String()).
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId.String()).
		Expect().
		Status(http.StatusOK).
		ContentType("text/csv")
	res.Header("Content-Disposition").Equal("attachment;filename=test.csv")
	res.Body().Equal("f1,f2,f3,location\ntest,123,true,\"12.000000, 11.000000\"\n")
}
