package repo

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
)

type AssetFilter struct {
	Sort       *asset.SortType
	Keyword    *string
	Pagination *usecasex.Pagination
}

type Asset interface {
	Filtered(WorkspaceFilter) Asset
	FindByWorkspaceProject(context.Context, accountdomain.WorkspaceID, *id.ProjectID, AssetFilter) ([]*asset.Asset, *usecasex.PageInfo, error)
	FindByURL(context.Context, string) (*asset.Asset, error)
	FindByID(context.Context, id.AssetID) (*asset.Asset, error)
	FindByIDs(context.Context, id.AssetIDList) ([]*asset.Asset, error)
	TotalSizeByWorkspace(context.Context, accountdomain.WorkspaceID) (int64, error)
	Save(context.Context, *asset.Asset) error
	Remove(context.Context, id.AssetID) error
	RemoveByProjectWithFile(context.Context, id.ProjectID, gateway.File) error
}
