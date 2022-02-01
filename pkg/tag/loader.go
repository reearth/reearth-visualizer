package tag

import "context"

type Loader func(context.Context, ...ID) ([]*Tag, error)
type SceneLoader func(context.Context, SceneID) ([]*Tag, error)

func LoaderFrom(data List) Loader {
	return func(ctx context.Context, ids ...ID) ([]*Tag, error) {
		res := make([]*Tag, 0, len(ids))
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

func LoaderFromMap(data map[ID]Tag) Loader {
	return func(ctx context.Context, ids ...ID) ([]*Tag, error) {
		res := make([]*Tag, 0, len(ids))
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

func SceneLoaderFrom(data List) SceneLoader {
	return func(ctx context.Context, id SceneID) ([]*Tag, error) {
		return data.FilterByScene(id).Refs(), nil
	}
}
