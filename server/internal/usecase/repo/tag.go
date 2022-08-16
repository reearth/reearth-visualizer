package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/tag"
)

type Tag interface {
	Filtered(SceneFilter) Tag
	FindByID(context.Context, id.TagID) (tag.Tag, error)
	FindByIDs(context.Context, id.TagIDList) ([]*tag.Tag, error)
	FindByScene(context.Context, id.SceneID) ([]*tag.Tag, error)
	FindItemByID(context.Context, id.TagID) (*tag.Item, error)
	FindItemByIDs(context.Context, id.TagIDList) ([]*tag.Item, error)
	FindGroupByID(context.Context, id.TagID) (*tag.Group, error)
	FindGroupByIDs(context.Context, id.TagIDList) ([]*tag.Group, error)
	FindRootsByScene(context.Context, id.SceneID) ([]*tag.Tag, error)
	FindGroupByItem(context.Context, id.TagID) (*tag.Group, error)
	Save(context.Context, tag.Tag) error
	SaveAll(context.Context, []*tag.Tag) error
	Remove(context.Context, id.TagID) error
	RemoveAll(context.Context, id.TagIDList) error
	RemoveByScene(context.Context, id.SceneID) error
}

func TagLoaderFrom(r Tag) tag.Loader {
	return func(ctx context.Context, ids ...id.TagID) ([]*tag.Tag, error) {
		return r.FindByIDs(ctx, ids)
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
