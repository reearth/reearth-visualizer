package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
)

type Tag interface {
	FindByID(context.Context, id.TagID, []id.SceneID) (tag.Tag, error)
	FindByIDs(context.Context, []id.TagID, []id.SceneID) ([]*tag.Tag, error)
	FindItemByID(context.Context, id.TagID, []id.SceneID) (*tag.Item, error)
	FindItemByIDs(context.Context, []id.TagID, []id.SceneID) ([]*tag.Item, error)
	FindGroupByID(context.Context, id.TagID, []id.SceneID) (*tag.Group, error)
	FindGroupByIDs(context.Context, []id.TagID, []id.SceneID) ([]*tag.Group, error)
	FindByScene(context.Context, id.SceneID) ([]*tag.Tag, error)
	FindGroupByItem(context.Context, id.TagID, []id.SceneID) (*tag.Group, error)
	FindGroupByScene(context.Context, id.SceneID) ([]*tag.Group, error)
	FindItemByScene(context.Context, id.SceneID) ([]*tag.Item, error)
	Save(context.Context, tag.Tag) error
	SaveAll(context.Context, []*tag.Tag) error
	Remove(context.Context, id.TagID) error
	RemoveAll(context.Context, []id.TagID) error
	RemoveByScene(context.Context, id.SceneID) error
}
