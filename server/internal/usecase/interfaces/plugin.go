package interfaces

import (
	"archive/zip"
	"context"
	"errors"
	"io"
	"net/url"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
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
	ExportPlugins(context.Context, *scene.Scene, *zip.Writer) ([]*plugin.Plugin, []*property.Schema, error)
	ImportPlugins(context.Context, map[string]*zip.File, string, *scene.Scene, *[]byte) (map[string]any, error)
}
