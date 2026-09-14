package domain

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

func TestHTTPDomainChecker_CanceledReturnedRaw(t *testing.T) {
	// A cancelled request must surface as context.Canceled, not be wrapped into
	// an internal error (which would log ERROR + STACK).
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	checker := NewHTTPDomainChecker(srv.URL, "", 5)

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // client gave up before the request completed

	_, err := checker.CheckDomain(ctx, gateway.DomainCheckRequest{Domain: "example.com"})
	assert.ErrorIs(t, err, context.Canceled)
}

func TestHTTPDomainChecker_NotFoundIsAllowedFalse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer srv.Close()

	checker := NewHTTPDomainChecker(srv.URL, "", 5)

	resp, err := checker.CheckDomain(context.Background(), gateway.DomainCheckRequest{Domain: "example.com"})
	assert.NoError(t, err)
	assert.False(t, resp.Allowed)
	// a 404 is a normal "not a custom domain" answer, never context.Canceled
	assert.False(t, errors.Is(err, context.Canceled))
}
