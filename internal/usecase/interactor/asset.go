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
	assetRepo   repo.Asset
	teamRepo    repo.Team
	transaction repo.Transaction
	file        gateway.File
}

func NewAsset(r *repo.Container, gr *gateway.Container) interfaces.Asset {
	return &Asset{
		assetRepo:   r.Asset,
		teamRepo:    r.Team,
		transaction: r.Transaction,
		file:        gr.File,
	}
}

func (i *Asset) Fetch(ctx context.Context, assets []id.AssetID, operator *usecase.Operator) ([]*asset.Asset, error) {
	return i.assetRepo.FindByIDs(ctx, assets, operator.AllReadableTeams())
}

func (i *Asset) FindByTeam(ctx context.Context, tid id.TeamID, p *usecase.Pagination, operator *usecase.Operator) ([]*asset.Asset, *usecase.PageInfo, error) {
	if err := i.CanReadTeam(tid, operator); err != nil {
		return nil, nil, err
	}

	return i.assetRepo.FindByTeam(ctx, tid, p)
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if err := i.CanWriteTeam(inp.TeamID, operator); err != nil {
		return nil, err
	}

	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	url, err := i.file.UploadAsset(ctx, inp.File)
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

	if err = i.assetRepo.Save(ctx, result); err != nil {
		return
	}

	tx.Commit()
	return
}

func (i *Asset) Remove(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	asset, err := i.assetRepo.FindByID(ctx, aid, operator.AllWritableTeams())
	if err != nil {
		return aid, err
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	team, err := i.teamRepo.FindByID(ctx, asset.Team())
	if err != nil {
		return aid, err
	}

	if !team.Members().ContainsUser(operator.User) {
		return aid, interfaces.ErrOperationDenied
	}

	if url, _ := url.Parse(asset.URL()); url != nil {
		if err = i.file.RemoveAsset(ctx, url); err != nil {
			return aid, err
		}
	}

	if err = i.assetRepo.Remove(ctx, aid); err != nil {
		return
	}

	tx.Commit()
	return aid, nil
}
