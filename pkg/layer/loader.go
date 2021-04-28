package layer

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
)

type Loader func(context.Context, ...id.LayerID) (List, error)
type LoaderByScene func(context.Context, id.SceneID) (List, error)

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
