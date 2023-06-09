package property

import (
	"context"
)

type Loader func(context.Context, ...ID) (List, error)

type SchemaLoader func(context.Context, ...SchemaID) (SchemaList, error)

func LoaderFrom(data []*Property) Loader {
	return func(ctx context.Context, ids ...ID) (List, error) {
		res := make([]*Property, 0, len(ids))
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

func LoaderFromMap(data map[ID]*Property) Loader {
	return func(ctx context.Context, ids ...ID) (List, error) {
		res := make([]*Property, 0, len(ids))
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

func SchemaLoaderFrom(data ...*Schema) SchemaLoader {
	return func(ctx context.Context, ids ...SchemaID) (SchemaList, error) {
		res := make([]*Schema, 0, len(ids))
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

func SchemaLoaderFromMap(data map[SchemaID]*Schema) SchemaLoader {
	return func(ctx context.Context, ids ...SchemaID) (SchemaList, error) {
		res := make([]*Schema, 0, len(ids))
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
