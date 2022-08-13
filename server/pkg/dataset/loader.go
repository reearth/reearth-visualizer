package dataset

import (
	"context"
)

type Loader func(context.Context, ...ID) (List, error)

func LoaderFrom(data []*Dataset) Loader {
	return func(ctx context.Context, ids ...ID) (List, error) {
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

func LoaderFromMap(data map[ID]*Dataset) Loader {
	return func(ctx context.Context, ids ...ID) (List, error) {
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
