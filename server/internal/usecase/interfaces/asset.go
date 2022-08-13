package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/asset"
	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
)

type AssetFilterType string

const (
	AssetFilterDate AssetFilterType = "DATE"
	AssetFilterSize AssetFilterType = "SIZE"
	AssetFilterName AssetFilterType = "NAME"
)

type CreateAssetParam struct {
	TeamID id.TeamID
	File   *file.File
}

var (
	ErrCreateAssetFailed error = errors.New("failed to create asset")
)

type Asset interface {
	Fetch(context.Context, []id.AssetID, *usecase.Operator) ([]*asset.Asset, error)
	FindByTeam(context.Context, id.TeamID, *string, *asset.SortType, *usecase.Pagination, *usecase.Operator) ([]*asset.Asset, *usecase.PageInfo, error)
	Create(context.Context, CreateAssetParam, *usecase.Operator) (*asset.Asset, error)
	Remove(context.Context, id.AssetID, *usecase.Operator) (id.AssetID, error)
}
