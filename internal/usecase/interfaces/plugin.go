package interfaces

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
)

var (
	ErrPluginAlreadyRegistered error = errors.New("plugin already registered")
)

type Plugin interface {
	Fetch(context.Context, []id.PluginID, *usecase.Operator) ([]*plugin.Plugin, error)
	Upload(context.Context, io.Reader, *usecase.Operator) (*plugin.Plugin, error)
}
