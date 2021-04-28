//go:generate go run github.com/99designs/gqlgen

package graphql

import (
	"errors"

	graphql "github.com/reearth/reearth-backend/internal/adapter/graphql"
)

// THIS CODE IS A STARTING POINT ONLY. IT WILL NOT BE UPDATED WITH SCHEMA CHANGES.

// Resolver _
type Resolver struct {
	config ResolverConfig
}

// ErrNotImplemented _
var ErrNotImplemented = errors.New("not impleneted yet")

// ErrUnauthorized _
var ErrUnauthorized = errors.New("unauthorized")

// ResolverConfig _
type ResolverConfig struct {
	Controllers *graphql.Container
	Debug       bool
}

// NewResolver _
func NewResolver(config ResolverConfig) ResolverRoot {
	return &Resolver{
		config: config,
	}
}
