package e2e

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/reearth/reearth/server/internal/app/config"
)

func TestPingAPI(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatal(err)
	}
	defer mr.Close()

	redisURL := fmt.Sprintf("redis://:@%s/0", mr.Addr())

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
		RedisURL: redisURL,
	}, false, nil)

	e.OPTIONS("/api/ping").
		WithHeader("Origin", "https://example.com").
		Expect().
		Status(http.StatusNoContent).
		Header("Access-Control-Allow-Origin").
		Equal("https://example.com")

	r := e.GET("/api/ping").
		WithHeader("Origin", "https://example.com").
		Expect()

	r.Header("Cache-Control").
		Equal("private, no-store, no-cache, must-revalidate")

	r.Header("Access-Control-Allow-Origin").
		Equal("https://example.com")

	r.Status(http.StatusOK).
		JSON().
		String().
		Equal("pong")
}
