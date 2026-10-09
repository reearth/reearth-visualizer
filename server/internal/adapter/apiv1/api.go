// Package apiv1 implements the REST API described by schemas/api/v1.yml.
//
// Handlers are thin: they parse IDs, call the same usecases as the GraphQL
// API, and convert the results. Authentication and the per-request usecase
// container come from the app's middleware, as for the other APIs.
package apiv1

//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@v2.7.0 --config=server.cfg.yml ../../../schemas/api/v1.yml

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
)

// Config is what the handlers need beyond the per-request usecases.
type Config struct {
	// PublishedHost is the published site's host pattern (Published.Host),
	// with "{}" standing for the published alias. Empty when not configured.
	PublishedHost string
	// File is the file storage, where project exports are written.
	File gateway.File
}

// Server implements StrictServerInterface.
type Server struct {
	publishedHost string
	file          gateway.File
}

var _ StrictServerInterface = Server{}

// NewHandler returns the API's handler, ready for RegisterHandlers.
func NewHandler(cfg Config) ServerInterface {
	return NewStrictHandler(Server{publishedHost: cfg.PublishedHost, file: cfg.File}, nil)
}

func usecases(ctx context.Context) (*interfaces.Container, *usecase.Operator) {
	return adapter.Usecases(ctx), adapter.Operator(ctx)
}
