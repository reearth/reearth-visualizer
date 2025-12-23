//go:build e2e

package e2e

import (
	"net/http"
	"testing"
)

func TestPingAPI(t *testing.T) {
	e, _ := ServerPingTest(t)

	e.OPTIONS("/api/ping").
		WithHeader("Origin", "https://example.com").
		Expect().
		Status(http.StatusNoContent).
		Header("Access-Control-Allow-Origin").
		IsEqual("https://example.com")

	r := e.GET("/api/ping").
		WithHeader("Origin", "https://example.com").
		Expect()

	r.Header("Cache-Control").
		IsEqual("private, no-store, no-cache, must-revalidate")

	r.Header("Access-Control-Allow-Origin").
		IsEqual("https://example.com")

	r.Status(http.StatusOK).
		JSON().
		String().
		IsEqual("pong")
}
