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
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
)

// Server implements StrictServerInterface.
type Server struct{}

var _ StrictServerInterface = Server{}

// NewHandler returns the API's handler, ready for RegisterHandlers.
func NewHandler() ServerInterface {
	return NewStrictHandler(Server{}, nil)
}

func usecases(ctx context.Context) (*interfaces.Container, *usecase.Operator) {
	return adapter.Usecases(ctx), adapter.Operator(ctx)
}
