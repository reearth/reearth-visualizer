package interfaces

import (
	"context"
	"errors"
	"io"
	"net/url"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/scene"
)

var (
	ErrPluginAlreadyRegistered = errors.New("plugin already registered")
	ErrInvalidPluginPackage    = errors.New("invalid plugin package")
)

type Plugin interface {
	Fetch(context.Context, []id.PluginID, *usecase.Operator) ([]*plugin.Plugin, error)
	Upload(context.Context, io.Reader, id.SceneID, *usecase.Operator) (*plugin.Plugin, *scene.Scene, error)
	UploadFromRemote(context.Context, *url.URL, id.SceneID, *usecase.Operator) (*plugin.Plugin, *scene.Scene, error)
}
