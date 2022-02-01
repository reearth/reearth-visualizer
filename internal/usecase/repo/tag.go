package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
)

type Tag interface {
	FindByID(context.Context, id.TagID, []id.SceneID) (tag.Tag, error)
	FindByIDs(context.Context, []id.TagID, []id.SceneID) ([]*tag.Tag, error)
	FindByScene(context.Context, id.SceneID) ([]*tag.Tag, error)
	FindItemByID(context.Context, id.TagID, []id.SceneID) (*tag.Item, error)
	FindItemByIDs(context.Context, []id.TagID, []id.SceneID) ([]*tag.Item, error)
	FindGroupByID(context.Context, id.TagID, []id.SceneID) (*tag.Group, error)
	FindGroupByIDs(context.Context, []id.TagID, []id.SceneID) ([]*tag.Group, error)
	FindRootsByScene(context.Context, id.SceneID) ([]*tag.Tag, error)
	FindGroupByItem(context.Context, id.TagID, []id.SceneID) (*tag.Group, error)
	Save(context.Context, tag.Tag) error
	SaveAll(context.Context, []*tag.Tag) error
	Remove(context.Context, id.TagID) error
	RemoveAll(context.Context, []id.TagID) error
	RemoveByScene(context.Context, id.SceneID) error
}

func TagLoaderFrom(r Tag, scenes []id.SceneID) tag.Loader {
	return func(ctx context.Context, ids ...id.TagID) ([]*tag.Tag, error) {
		return r.FindByIDs(ctx, ids, scenes)
	}
}

func TagSceneLoaderFrom(r Tag, scenes []id.SceneID) tag.SceneLoader {
	return func(ctx context.Context, id id.SceneID) ([]*tag.Tag, error) {
		found := false
		for _, s := range scenes {
			if id == s {
				found = true
				break
			}
		}
		if !found {
			return nil, nil
		}
		return r.FindByScene(ctx, id)
	}
}
