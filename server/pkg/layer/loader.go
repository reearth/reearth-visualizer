package layer

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/samber/lo"
)

type Loader func(context.Context, ...id.LayerID) (List, error)
type LoaderByScene func(context.Context, SceneID) (List, error)

var WalkerSkipChildren = errors.New("LAYER_WALKER_SKIP_CHILDREN")

func LoaderFrom(data []Layer) Loader {
	return func(ctx context.Context, ids ...id.LayerID) (List, error) {
		res := make([]*Layer, 0, len(ids))
		for _, i := range ids {
			found := false
			for _, d := range data {
				if i == d.ID() {
					res = append(res, &d)
					found = true
					break
				}
			}
			if !found {
				res = append(res, nil)
			}
		}
		return res, nil
	}
}

func LoaderFromMap(data map[id.LayerID]Layer) Loader {
	return func(ctx context.Context, ids ...id.LayerID) (List, error) {
		res := make([]*Layer, 0, len(ids))
		for _, i := range ids {
			if d, ok := data[i]; ok {
				res = append(res, &d)
			} else {
				res = append(res, nil)
			}
		}
		return res, nil
	}
}

func (l Loader) Walk(ctx context.Context, walker func(Layer, GroupList) error, init []id.LayerID) error {
	var walk func(ids []id.LayerID, parents GroupList) error
	walk = func(ids []id.LayerID, parents GroupList) error {
		loaded, err := l(ctx, ids...)
		if err != nil {
			return err
		}
		for _, l := range loaded.Deref() {
			if l == nil {
				continue
			}
			if err := walker(l, parents); err == WalkerSkipChildren {
				continue
			} else if err != nil {
				return err
			}
			if lg := ToLayerGroup(l); lg != nil && lg.Layers().LayerCount() > 0 {
				if err := walk(lg.Layers().Layers(), append(parents, lg)); err != nil {
					return err
				}
			}
		}
		return nil
	}
	return walk(init, nil)
}

func LoaderBySceneFrom(data ...Layer) LoaderByScene {
	return func(ctx context.Context, id SceneID) (List, error) {
		res := lo.Filter(data, func(l Layer, _ int) bool {
			return l.Scene() == id
		})
		return ListFrom(res), nil
	}
}
