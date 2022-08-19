package repo

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
)

type AssetFilter struct {
	Sort       *asset.SortType
	Keyword    *string
	Pagination *usecase.Pagination
}

type Asset interface {
	Filtered(WorkspaceFilter) Asset
	FindByWorkspace(context.Context, id.WorkspaceID, AssetFilter) ([]*asset.Asset, *usecase.PageInfo, error)
	FindByID(context.Context, id.AssetID) (*asset.Asset, error)
	FindByIDs(context.Context, id.AssetIDList) ([]*asset.Asset, error)
	TotalSizeByWorkspace(context.Context, id.WorkspaceID) (int64, error)
	Save(context.Context, *asset.Asset) error
	Remove(context.Context, id.AssetID) error
}
