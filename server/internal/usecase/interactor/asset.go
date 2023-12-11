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
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
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

func (i *Asset) FindByWorkspace(ctx context.Context, tid accountdomain.WorkspaceID, keyword *string, sort *asset.SortType, p *usecasex.Pagination, operator *usecase.Operator) ([]*asset.Asset, *usecasex.PageInfo, error) {
	return Run2(
		ctx, operator, i.repos,
		Usecase().WithReadableWorkspaces(tid),
		func(ctx context.Context) ([]*asset.Asset, *usecasex.PageInfo, error) {
			return i.repos.Asset.FindByWorkspace(ctx, tid, repo.AssetFilter{
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

	ws, err := i.repos.Workspace.FindByID(ctx, inp.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if !operator.IsWritableWorkspace(ws.ID()) {
		return nil, interfaces.ErrOperationDenied
	}

	url, size, err := i.gateways.File.UploadAsset(ctx, inp.File)
	if err != nil {
		return nil, err
	}

	// enforce policy
	if policyID := operator.Policy(ws.Policy()); policyID != nil {
		p, err := i.repos.Policy.FindByID(ctx, *policyID)
		if err != nil {
			return nil, err
		}
		s, err := i.repos.Asset.TotalSizeByWorkspace(ctx, ws.ID())
		if err != nil {
			return nil, err
		}
		if err := p.EnforceAssetStorageSize(s + size); err != nil {
			_ = i.gateways.File.RemoveAsset(ctx, url)
			return nil, err
		}
	}

	a, err := asset.New().
		NewID().
		Workspace(inp.WorkspaceID).
		Name(path.Base(inp.File.Path)).
		Size(size).
		URL(url.String()).
		Build()
	if err != nil {
		return nil, err
	}

	if err := i.repos.Asset.Save(ctx, a); err != nil {
		return nil, err
	}

	return a, nil
}

func (i *Asset) Remove(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (id.AssetID, error) {
			asset, err := i.repos.Asset.FindByID(ctx, aid)
			if err != nil {
				return aid, err
			}

			if ok := operator.IsWritableWorkspace(asset.Workspace()); !ok {
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
