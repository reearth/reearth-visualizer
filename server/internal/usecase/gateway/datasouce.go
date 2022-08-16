package gateway

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
)

var (
	ErrDataSourceInvalidURL error = errors.New("invalid url")
)

type DataSource interface {
	Fetch(context.Context, string, id.SceneID) ([]*dataset.Schema, []*dataset.Dataset, error)
	IsURLValid(context.Context, string) bool
}
