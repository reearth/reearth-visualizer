package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
)

type Style interface {
	Filtered(SceneFilter) Style
	FindByID(context.Context, id.StyleID) (*scene.Style, error)
	FindByIDs(context.Context, id.StyleIDList) (*scene.StyleList, error)
	FindByScene(context.Context, id.SceneID) (*scene.StyleList, error)
	Save(context.Context, scene.Style) error
	SaveAll(context.Context, scene.StyleList) error
	Remove(context.Context, id.StyleID) error
	RemoveAll(context.Context, id.StyleIDList) error
	RemoveByScene(context.Context, id.SceneID) error
}
