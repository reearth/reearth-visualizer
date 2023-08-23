package nlslayer

import (
	"context"
	"errors"

	"github.com/samber/lo"
)

type Loader func(context.Context, ...ID) (NLSLayerList, error)
type LoaderByScene func(context.Context, SceneID) (NLSLayerList, error)

var WalkerSkipChildren = errors.New("LAYER_WALKER_SKIP_CHILDREN")

func LoaderFrom(data []NLSLayer) Loader {
	return func(ctx context.Context, ids ...ID) (NLSLayerList, error) {
		res := make([]*NLSLayer, 0, len(ids))
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

func LoaderFromMap(data map[ID]NLSLayer) Loader {
	return func(ctx context.Context, ids ...ID) (NLSLayerList, error) {
		res := make([]*NLSLayer, 0, len(ids))
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

func (l Loader) Walk(ctx context.Context, walker func(NLSLayer, NLSLayerGroupList) error, init []ID) error {
	var walk func(ids []ID, parents NLSLayerGroupList) error
	walk = func(ids []ID, parents NLSLayerGroupList) error {
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
			if lg := ToNLSLayerGroup(l); lg != nil && lg.Children().LayerCount() > 0 {
				if err := walk(lg.Children().Layers(), append(parents, lg)); err != nil {
					return err
				}
			}
		}
		return nil
	}
	return walk(init, nil)
}

func LoaderBySceneFrom(data ...NLSLayer) LoaderByScene {
	return func(ctx context.Context, id SceneID) (NLSLayerList, error) {
		res := lo.Filter(data, func(l NLSLayer, _ int) bool {
			return l.Scene() == id
		})
		return ListFrom(res), nil
	}
}
