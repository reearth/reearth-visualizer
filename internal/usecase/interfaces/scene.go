package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type UpdateWidgetParam struct {
	SceneID     id.SceneID
	PluginID    id.PluginID
	ExtensionID id.PluginExtensionID
	Enabled     *bool
}

var (
	ErrPluginAlreadyInstalled    error = errors.New("plugin already installed")
	ErrPluginNotInstalled        error = errors.New("plugin not installed")
	ErrExtensionTypeMustBeWidget error = errors.New("extension type must be widget")
)

type Scene interface {
	Fetch(context.Context, []id.SceneID, *usecase.Operator) ([]*scene.Scene, error)
	FindByProject(context.Context, id.ProjectID, *usecase.Operator) (*scene.Scene, error)
	FetchLock(context.Context, []id.SceneID, *usecase.Operator) ([]scene.LockMode, error)
	Create(context.Context, id.ProjectID, *usecase.Operator) (*scene.Scene, error)
	AddWidget(context.Context, id.SceneID, id.PluginID, id.PluginExtensionID, *usecase.Operator) (*scene.Scene, *scene.Widget, error)
	UpdateWidget(context.Context, UpdateWidgetParam, *usecase.Operator) (*scene.Scene, *scene.Widget, error)
	RemoveWidget(context.Context, id.SceneID, id.PluginID, id.PluginExtensionID, *usecase.Operator) (*scene.Scene, error)
	InstallPlugin(context.Context, id.SceneID, id.PluginID, *usecase.Operator) (*scene.Scene, id.PluginID, *id.PropertyID, error)
	UninstallPlugin(context.Context, id.SceneID, id.PluginID, *usecase.Operator) (*scene.Scene, error)
	UpgradePlugin(context.Context, id.SceneID, id.PluginID, id.PluginID, *usecase.Operator) (*scene.Scene, error)
}
