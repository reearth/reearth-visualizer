package e2e

import (
	"net/http"
	"testing"
)

func TestPingAPI(t *testing.T) {
	e := Server(t, nil)

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
