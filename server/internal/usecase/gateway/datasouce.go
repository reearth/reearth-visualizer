package gateway

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
)

var (
	ErrDataSourceInvalidURL error = errors.New("invalid url")
)

type AuthConfig struct {
	Type     string
	Username string
	Password string
	APIKey   string
}

type DataSource interface {
	Fetch(context.Context, string, id.SceneID) (dataset.SchemaList, dataset.List, error)
	IsURLValid(context.Context, string) bool
	FetchWithAuth(ctx context.Context, url string, sceneID id.SceneID, auth *dataset.AuthConfig) (dataset.SchemaList, dataset.List, error)
	FetchRaw(ctx context.Context, url string, auth *dataset.AuthConfig) (io.ReadCloser, error)
}
