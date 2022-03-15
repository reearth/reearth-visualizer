package repo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/asset"
	"github.com/reearth/reearth-backend/pkg/id"
)

type Asset interface {
	Filtered(TeamFilter) Asset
	FindByTeam(context.Context, id.TeamID, *usecase.Pagination) ([]*asset.Asset, *usecase.PageInfo, error)
	FindByID(context.Context, id.AssetID) (*asset.Asset, error)
	FindByIDs(context.Context, []id.AssetID) ([]*asset.Asset, error)
	Save(context.Context, *asset.Asset) error
	Remove(context.Context, id.AssetID) error
}
