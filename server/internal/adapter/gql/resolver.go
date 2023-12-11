//go:generate go run github.com/99designs/gqlgen

package gql

import (
	"errors"
)

// THIS CODE IS A STARTING POINT ONLY. IT WILL NOT BE UPDATED WITH SCHEMA CHANGES.

var ErrNotImplemented = errors.New("not implemented yet")
var ErrUnauthorized = errors.New("unauthorized")

type Resolver struct {
}

func NewResolver() ResolverRoot {
	return &Resolver{}
}
