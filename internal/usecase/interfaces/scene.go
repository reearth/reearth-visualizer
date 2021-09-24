package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"
)

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
	UpdateWidgetAlignSystem(context.Context, UpdateWidgetAlignSystemParam, *usecase.Operator) (*scene.Scene, error)
	RemoveWidget(context.Context, id.SceneID, id.WidgetID, *usecase.Operator) (*scene.Scene, error)
	InstallPlugin(context.Context, id.SceneID, id.PluginID, *usecase.Operator) (*scene.Scene, id.PluginID, *id.PropertyID, error)
	UninstallPlugin(context.Context, id.SceneID, id.PluginID, *usecase.Operator) (*scene.Scene, error)
	UpgradePlugin(context.Context, id.SceneID, id.PluginID, id.PluginID, *usecase.Operator) (*scene.Scene, error)
}

type UpdateWidgetParam struct {
	SceneID  id.SceneID
	WidgetID id.WidgetID
	Enabled  *bool
	Extended *bool
	Location *scene.WidgetLocation
	Index    *int
}

type UpdateWidgetAlignSystemParam struct {
	SceneID  id.SceneID
	Location scene.WidgetLocation
	Align    *scene.WidgetAlignType
}
