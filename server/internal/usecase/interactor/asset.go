package interactor

import (
	"context"
	"net/url"
	"path"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
)

type Asset struct {
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

func (i *Asset) FindByTeam(ctx context.Context, tid id.WorkspaceID, keyword *string, sort *asset.SortType, p *usecase.Pagination, operator *usecase.Operator) ([]*asset.Asset, *usecase.PageInfo, error) {
	return Run2(
		ctx, operator, i.repos,
		Usecase().WithReadableTeams(tid),
		func() ([]*asset.Asset, *usecase.PageInfo, error) {
			return i.repos.Asset.FindByTeam(ctx, tid, repo.AssetFilter{
				Sort:       sort,
				Keyword:    keyword,
				Pagination: p,
			})
		},
	)
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}
	return Run1(
		ctx, operator, i.repos,
		Usecase().
			WithWritableTeams(inp.TeamID).
			Transaction(),
		func() (*asset.Asset, error) {
			url, err := i.gateways.File.UploadAsset(ctx, inp.File)
			if err != nil {
				return nil, err
			}

			a, err := asset.New().
				NewID().
				Team(inp.TeamID).
				Name(path.Base(inp.File.Path)).
				Size(inp.File.Size).
				URL(url.String()).
				Build()
			if err != nil {
				return nil, err
			}

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			return a, nil
		})
}

func (i *Asset) Remove(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func() (id.AssetID, error) {
			asset, err := i.repos.Asset.FindByID(ctx, aid)
			if err != nil {
				return aid, err
			}

			if ok := operator.IsWritableTeam(asset.Team()); !ok {
				return aid, interfaces.ErrOperationDenied
			}

			if url, _ := url.Parse(asset.URL()); url != nil {
				if err := i.gateways.File.RemoveAsset(ctx, url); err != nil {
					return aid, err
				}
			}

			return aid, i.repos.Asset.Remove(ctx, aid)
		},
	)
}
