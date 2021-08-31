//go:generate go run github.com/99designs/gqlgen

package gql

import (
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
)

// THIS CODE IS A STARTING POINT ONLY. IT WILL NOT BE UPDATED WITH SCHEMA CHANGES.

var ErrNotImplemented = errors.New("not impleneted yet")
var ErrUnauthorized = errors.New("unauthorized")

type Resolver struct {
	usecases interfaces.Container
	loaders  Loaders
	debug    bool
}

func NewResolver(loaders Loaders, debug bool) ResolverRoot {
	return &Resolver{
		usecases: loaders.usecases,
		loaders:  loaders,
		debug:    debug,
	}
}
