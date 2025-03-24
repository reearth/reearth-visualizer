package property

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
)

type Loader func(context.Context, ...id.PropertyID) (List, error)

type SchemaLoader func(context.Context, ...id.PropertySchemaID) (SchemaList, error)

func LoaderFrom(data []*Property) Loader {
	return func(ctx context.Context, ids ...id.PropertyID) (List, error) {
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

func LoaderFromMap(data map[id.PropertyID]*Property) Loader {
	return func(ctx context.Context, ids ...id.PropertyID) (List, error) {
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
	return func(ctx context.Context, ids ...id.PropertySchemaID) (SchemaList, error) {
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

func SchemaLoaderFromMap(data map[id.PropertySchemaID]*Schema) SchemaLoader {
	return func(ctx context.Context, ids ...id.PropertySchemaID) (SchemaList, error) {
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
