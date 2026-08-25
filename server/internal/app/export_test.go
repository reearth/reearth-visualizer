package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

// stubFileGateway is a minimal gateway.File stub, sufficient only to make
// serveExportFile register its route. Its methods are never expected to be
// called by TestServeExportFile_CacheControlHeader, since that test uses an
// invalid project ID, which the handler rejects before touching the file
// gateway at all.
type stubFileGateway struct {
	gateway.File
}

// stubDomainChecker always denies, since the test only cares about the
// Cache-Control header, not the CORS decision.
type stubDomainChecker struct{}

func (stubDomainChecker) CheckDomain(context.Context, gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
	return &gateway.DomainCheckResponse{Allowed: false}, nil
}

// TestServeExportFile_CacheControlHeader is a regression test for SEC-04:
// GET /export/:filename streamed a project's export zip with no
// Cache-Control header at all, relying entirely on intermediary defaults. A
// CDN or shared cache placed in front of this service could have stored an
// authorized response and served it to a different, unauthenticated
// requester of the same predictable URL. This confirms the response always
// carries a no-cache directive, regardless of whether the request succeeds.
func TestServeExportFile_CacheControlHeader(t *testing.T) {
	e := echo.New()
	cfg := &ServerConfig{Config: &config.Config{}}

	serveExportFile(e, cfg, nil, stubDomainChecker{}, &stubFileGateway{})

	req := httptest.NewRequest(http.MethodGet, "/export/not-a-valid-project-id.zip", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, "private, no-store, no-cache, must-revalidate", rec.Header().Get(echo.HeaderCacheControl))
}
