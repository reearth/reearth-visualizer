package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
)

type AssetFilterType string

const (
	AssetFilterDate AssetFilterType = "DATE"
	AssetFilterSize AssetFilterType = "SIZE"
	AssetFilterName AssetFilterType = "NAME"
)

type CreateAssetParam struct {
	WorkspaceID id.WorkspaceID
	File        *file.File
}

var (
	ErrCreateAssetFailed error = errors.New("failed to create asset")
)

type Asset interface {
	Fetch(context.Context, []id.AssetID, *usecase.Operator) ([]*asset.Asset, error)
	FindByWorkspace(context.Context, id.WorkspaceID, *string, *asset.SortType, *usecase.Pagination, *usecase.Operator) ([]*asset.Asset, *usecase.PageInfo, error)
	Create(context.Context, CreateAssetParam, *usecase.Operator) (*asset.Asset, error)
	Remove(context.Context, id.AssetID, *usecase.Operator) (id.AssetID, error)
}
