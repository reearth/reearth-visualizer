package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
)

type Dataset interface {
	Filtered(SceneFilter) Dataset
	FindByID(context.Context, id.DatasetID) (*dataset.Dataset, error)
	FindByIDs(context.Context, id.DatasetIDList) (dataset.List, error)
	FindBySchema(context.Context, id.DatasetSchemaID, *usecasex.Pagination) (dataset.List, *usecasex.PageInfo, error)
	CountBySchema(context.Context, id.DatasetSchemaID) (int, error)
	FindBySchemaAll(context.Context, id.DatasetSchemaID) (dataset.List, error)
	FindBySchemaAllBy(context.Context, id.DatasetSchemaID, func(*dataset.Dataset) error) error
	FindGraph(context.Context, id.DatasetID, id.DatasetFieldIDList) (dataset.List, error)
	Save(context.Context, *dataset.Dataset) error
	SaveAll(context.Context, dataset.List) error
	Remove(context.Context, id.DatasetID) error
	RemoveAll(context.Context, id.DatasetIDList) error
	RemoveByScene(context.Context, id.SceneID) error
}

func DatasetLoaderFrom(r Dataset) dataset.Loader {
	return func(ctx context.Context, ids ...id.DatasetID) (dataset.List, error) {
		return r.FindByIDs(ctx, ids)
	}
}

func DatasetGraphLoaderFrom(r Dataset) dataset.GraphLoader {
	return func(ctx context.Context, root id.DatasetID, fields ...id.DatasetFieldID) (dataset.List, *dataset.Field, error) {
		if len(fields) <= 1 {
			d, err := r.FindByID(ctx, root)
			if err != nil {
				return nil, nil, err
			}
			var field *dataset.Field
			if len(fields) == 1 {
				field = d.Field(fields[0])
			}
			return dataset.List{d}, field, nil
		}

		list2, err := r.FindGraph(ctx, root, fields)
		if err != nil {
			return nil, nil, err
		}
		return list2, list2.Last().Field(fields[len(fields)-1]), nil
	}
}
