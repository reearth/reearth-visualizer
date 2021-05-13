package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/asset"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
)

type Asset struct {
	lock sync.Mutex
	data map[id.AssetID]*asset.Asset
}

func NewAsset() repo.Asset {
	return &Asset{
		data: map[id.AssetID]*asset.Asset{},
	}
}

func (r *Asset) FindByID(ctx context.Context, id id.AssetID) (*asset.Asset, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if ok {
		return d, nil
	}
	return &asset.Asset{}, err1.ErrNotFound
}

func (r *Asset) Save(ctx context.Context, a *asset.Asset) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[a.ID()] = a
	return nil
}

func (r *Asset) Remove(ctx context.Context, id id.AssetID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	delete(r.data, id)
	return nil
}

func (r *Asset) FindByTeam(ctx context.Context, id id.TeamID, pagination *usecase.Pagination) ([]*asset.Asset, *usecase.PageInfo, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*asset.Asset{}
	for _, d := range r.data {
		if d.Team() == id {
			result = append(result, d)
		}
	}

	var startCursor, endCursor *usecase.Cursor
	if len(result) > 0 {
		_startCursor := usecase.Cursor(result[0].ID().String())
		_endCursor := usecase.Cursor(result[len(result)-1].ID().String())
		startCursor = &_startCursor
		endCursor = &_endCursor
	}

	return result, usecase.NewPageInfo(
		len(r.data),
		startCursor,
		endCursor,
		true,
		true,
	), nil
}
