package dataset

import (
	"context"
)

type GraphLoader func(context.Context, ID, ...FieldID) (List, *Field, error)

func GraphLoaderFromMap(m Map) GraphLoader {
	return func(ctx context.Context, root ID, fields ...FieldID) (List, *Field, error) {
		list, field := m.GraphSearchByFields(root, fields...)
		return list, field, nil
	}
}

func GraphLoaderFromMapAndGraph(m Map, g GraphLoader) GraphLoader {
	return func(ctx context.Context, root ID, fields ...FieldID) (List, *Field, error) {
		if m != nil {
			if len(fields) == 0 {
				return List{m[root]}, nil, nil
			}
			if len(fields) == 1 {
				ds := m[root]
				return List{ds}, ds.Field(fields[0]), nil
			}
			list, field := m.GraphSearchByFields(root, fields...)
			if list != nil && field != nil {
				return list, field, nil
			}
		}

		// it needs looking up dataset graph
		return g(ctx, root, fields...)
	}
}
