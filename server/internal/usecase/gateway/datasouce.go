package gateway

import (
	"context"
	"errors"
)

var (
	ErrDataSourceInvalidURL error = errors.New("invalid url")
)

type DataSource interface {
	IsURLValid(context.Context, string) bool
}
