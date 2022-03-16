package interactor

import (
	"context"
	"net/url"
	"path"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/asset"
	"github.com/reearth/reearth-backend/pkg/id"
)

type Asset struct {
	common
	repos    *repo.Container
	gateways *gateway.Container
}

func NewAsset(r *repo.Container, g *gateway.Container) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
	}
}

func (i *Asset) Fetch(ctx context.Context, assets []id.AssetID, operator *usecase.Operator) ([]*asset.Asset, error) {
	return i.repos.Asset.FindByIDs(ctx, assets)
}

func (i *Asset) FindByTeam(ctx context.Context, tid id.TeamID, keyword *string, sort *asset.SortType, p *usecase.Pagination, operator *usecase.Operator) ([]*asset.Asset, *usecase.PageInfo, error) {
	if err := i.CanReadTeam(tid, operator); err != nil {
		return nil, nil, err
	}

	return i.repos.Asset.FindByTeam(ctx, tid, repo.AssetFilter{
		Sort:       sort,
		Keyword:    keyword,
		Pagination: p,
	})
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if err := i.CanWriteTeam(inp.TeamID, operator); err != nil {
		return nil, err
	}

	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}

	tx, err := i.repos.Transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	url, err := i.gateways.File.UploadAsset(ctx, inp.File)
	if err != nil {
		return nil, err
	}

	result, err = asset.New().
		NewID().
		Team(inp.TeamID).
		Name(path.Base(inp.File.Path)).
		Size(inp.File.Size).
		URL(url.String()).
		Build()
	if err != nil {
		return nil, err
	}

	if err = i.repos.Asset.Save(ctx, result); err != nil {
		return
	}

	tx.Commit()
	return
}

func (i *Asset) Remove(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	asset, err := i.repos.Asset.FindByID(ctx, aid)
	if err != nil {
		return aid, err
	}

	tx, err := i.repos.Transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	team, err := i.repos.Team.FindByID(ctx, asset.Team())
	if err != nil {
		return aid, err
	}

	if !team.Members().ContainsUser(operator.User) {
		return aid, interfaces.ErrOperationDenied
	}

	if url, _ := url.Parse(asset.URL()); url != nil {
		if err = i.gateways.File.RemoveAsset(ctx, url); err != nil {
			return aid, err
		}
	}

	if err = i.repos.Asset.Remove(ctx, aid); err != nil {
		return
	}

	tx.Commit()
	return aid, nil
}
