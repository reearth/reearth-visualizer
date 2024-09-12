package gqlmodel

import (
	"io"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func RefToIndex(i *int) int {
	if i == nil {
		return -1
	}
	return *i
}

func RefToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func stringToRef(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func BoolToRef(b bool) *bool {
	return &b
}

func ToPageInfo(p *usecasex.PageInfo) *PageInfo {
	if p == nil {
		return &PageInfo{}
	}
	return &PageInfo{
		StartCursor:     p.StartCursor,
		EndCursor:       p.EndCursor,
		HasNextPage:     p.HasNextPage,
		HasPreviousPage: p.HasPreviousPage,
	}
}

func ToVisualizer(v visualizer.Visualizer) Visualizer {
	switch v {
	case visualizer.VisualizerCesium:
		return VisualizerCesium
	}
	return Visualizer("")
}

func ToVisualizerRef(v visualizer.Visualizer) *Visualizer {
	if v == "" {
		return nil
	}
	v2 := ToVisualizer(v)
	return &v2
}

func FromFile(f *graphql.Upload) *file.File {
	if f == nil {
		return nil
	}
	return &file.File{
		Content:     io.NopCloser(f.File),
		Path:        f.Filename,
		Size:        f.Size,
		ContentType: f.ContentType,
	}
}

func FromListOperation(op ListOperation) interfaces.ListOperation {
	if op == ListOperationAdd {
		return interfaces.ListOperationAdd
	} else if op == ListOperationMove {
		return interfaces.ListOperationMove
	} else if op == ListOperationRemove {
		return interfaces.ListOperationRemove
	}
	return interfaces.ListOperation("")
}

func ToPagination(pagination *Pagination) *usecasex.Pagination {
	if pagination == nil {
		return nil
	}
	return usecasex.CursorPagination{
		Before: pagination.Before,
		After:  pagination.After,
		First:  intToInt64(pagination.First),
		Last:   intToInt64(pagination.Last),
	}.Wrap()
}

func intToInt64(i *int) *int64 {
	if i == nil {
		return nil
	}
	return lo.ToPtr(int64(*i))
}
