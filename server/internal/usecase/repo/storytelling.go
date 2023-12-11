package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/storytelling"
)

type Storytelling interface {
	Filtered(SceneFilter) Storytelling
	FindByID(context.Context, id.StoryID) (*storytelling.Story, error)
	FindByIDs(context.Context, id.StoryIDList) (*storytelling.StoryList, error)
	FindByScene(context.Context, id.SceneID) (*storytelling.StoryList, error)
	FindByPublicName(ctx context.Context, alias string) (*storytelling.Story, error)
	Save(context.Context, storytelling.Story) error
	SaveAll(context.Context, storytelling.StoryList) error
	Remove(context.Context, id.StoryID) error
	RemoveAll(context.Context, id.StoryIDList) error
	RemoveByScene(context.Context, id.SceneID) error
}
