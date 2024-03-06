package interfaces

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
)

type AddStyleInput struct {
	SceneID id.SceneID
	Name    string
	Value   *scene.StyleValue
}

type UpdateStyleInput struct {
	StyleID id.StyleID
	Name    *string
	Value   *scene.StyleValue
}

type Style interface {
	Fetch(context.Context, id.StyleIDList, *usecase.Operator) (*scene.StyleList, error)
	FetchByScene(context.Context, id.SceneID, *usecase.Operator) (*scene.StyleList, error)
	AddStyle(context.Context, AddStyleInput, *usecase.Operator) (*scene.Style, error)
	UpdateStyle(context.Context, UpdateStyleInput, *usecase.Operator) (*scene.Style, error)
	RemoveStyle(context.Context, id.StyleID, *usecase.Operator) (id.StyleID, error)
	DuplicateStyle(context.Context, id.StyleID, *usecase.Operator) (*scene.Style, error)
}
