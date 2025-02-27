package plugin

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
)

type Loader func(context.Context, []id.PluginID) (List, error)

func LoaderFrom(data ...*Plugin) Loader {
	return func(ctx context.Context, ids []id.PluginID) (List, error) {
		res := make(List, 0, len(ids))
		for _, i := range ids {
			found := false
			for _, d := range data {
				if i == d.ID() {
					res = append(res, d)
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

func LoaderFromMap(data map[id.PluginID]*Plugin) Loader {
	return func(ctx context.Context, ids []id.PluginID) (List, error) {
		res := make(List, 0, len(ids))
		for _, i := range ids {
			if d, ok := data[i]; ok {
				res = append(res, d)
			} else {
				res = append(res, nil)
			}
		}
		return res, nil
	}
}
