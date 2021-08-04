package interfaces

import (
	"context"
	"errors"
	"io"
	"net/url"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/scene"
)

var (
	ErrPluginAlreadyRegistered  = errors.New("plugin already registered")
	ErrInvalidPluginPackage     = errors.New("invalid plugin package")
	ErrCannotDeletePublicPlugin = errors.New("cannot delete public plugin")
	ErrCannotDeleteUsedPlugin   = errors.New("cannot delete plugin used by at least one scene")
)

type Plugin interface {
	Fetch(context.Context, []id.PluginID, *usecase.Operator) ([]*plugin.Plugin, error)
	Upload(context.Context, io.Reader, id.SceneID, *usecase.Operator) (*plugin.Plugin, *scene.Scene, error)
	UploadFromRemote(context.Context, *url.URL, id.SceneID, *usecase.Operator) (*plugin.Plugin, *scene.Scene, error)
	Delete(context.Context, id.PluginID, *usecase.Operator) error
	FetchPluginMetadata(context.Context, *usecase.Operator) ([]*plugin.Metadata, error)
}
