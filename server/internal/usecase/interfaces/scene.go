package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
)

var (
	ErrPluginAlreadyInstalled    error = errors.New("plugin already installed")
	ErrPluginNotInstalled        error = errors.New("plugin not installed")
	ErrCannotUpgradeToPlugin     error = errors.New("cannot upgrade to such plugin")
	ErrExtensionTypeMustBeWidget error = errors.New("extension type must be widget")
)

type Scene interface {
	Fetch(context.Context, []id.SceneID, *usecase.Operator) ([]*scene.Scene, error)
	FindByProject(context.Context, id.ProjectID, *usecase.Operator) (*scene.Scene, error)
	FindByProjectsWithStory(context.Context, []id.ProjectID, *usecase.Operator) ([]*scene.Scene, *storytelling.StoryList, error)
	Create(context.Context, id.ProjectID, bool, *usecase.Operator) (*scene.Scene, error)
	AddWidget(context.Context, id.SceneID, id.PluginID, id.PluginExtensionID, *usecase.Operator) (*scene.Scene, *scene.Widget, error)
	UpdateWidget(context.Context, UpdateWidgetParam, *usecase.Operator) (*scene.Scene, *scene.Widget, error)
	UpdateWidgetAlignSystem(context.Context, UpdateWidgetAlignSystemParam, *usecase.Operator) (*scene.Scene, error)
	RemoveWidget(context.Context, id.SceneID, id.WidgetID, *usecase.Operator) (*scene.Scene, error)
	InstallPlugin(context.Context, id.SceneID, id.PluginID, *usecase.Operator) (*scene.Scene, *id.PropertyID, error)
	UninstallPlugin(context.Context, id.SceneID, id.PluginID, *usecase.Operator) (*scene.Scene, error)
	UpgradePlugin(context.Context, id.SceneID, id.PluginID, id.PluginID, *usecase.Operator) (*scene.Scene, error)
	ExportScene(context.Context, *project.Project) (*scene.Scene, map[string]any, error)
	ImportScene(context.Context, *scene.Scene, *[]byte) (*scene.Scene, error)
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
	SceneID    id.SceneID
	Location   scene.WidgetLocation
	Align      *scene.WidgetAlignType
	Padding    *scene.WidgetAreaPadding
	Gap        *int
	Centered   *bool
	Background *string
}
