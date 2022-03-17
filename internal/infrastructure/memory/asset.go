package memory

import (
	"context"
	"sort"
	"strings"
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/asset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type Asset struct {
	lock sync.Mutex
	data map[id.AssetID]*asset.Asset
	f    repo.TeamFilter
}

func NewAsset() repo.Asset {
	return &Asset{
		data: map[id.AssetID]*asset.Asset{},
	}
}

func (r *Asset) Filtered(f repo.TeamFilter) repo.Asset {
	return &Asset{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Asset) FindByID(ctx context.Context, id id.AssetID) (*asset.Asset, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if ok && r.f.CanRead(d.Team()) {
		return d, nil
	}
	return &asset.Asset{}, rerror.ErrNotFound
}

func (r *Asset) FindByIDs(ctx context.Context, ids []id.AssetID) ([]*asset.Asset, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*asset.Asset{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			if r.f.CanRead(d.Team()) {
				result = append(result, d)
				continue
			}
		}
		result = append(result, nil)
	}
	return result, nil
}

func (r *Asset) FindByTeam(ctx context.Context, id id.TeamID, filter repo.AssetFilter) ([]*asset.Asset, *usecase.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecase.EmptyPageInfo(), nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*asset.Asset{}
	for _, d := range r.data {
		if d.Team() == id && (filter.Keyword == nil || strings.Contains(d.Name(), *filter.Keyword)) {
			result = append(result, d)
		}
	}

	if filter.Sort != nil {
		s := *filter.Sort
		sort.SliceStable(result, func(i, j int) bool {
			if s == asset.SortTypeID {
				return result[i].ID().ID().Compare(result[j].ID().ID()) < 0
			}
			if s == asset.SortTypeSize {
				return result[i].Size() < result[j].Size()
			}
			if s == asset.SortTypeName {
				return strings.Compare(result[i].Name(), result[j].Name()) < 0
			}
			return false
		})
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

func (r *Asset) Save(ctx context.Context, a *asset.Asset) error {
	if !r.f.CanWrite(a.Team()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[a.ID()] = a
	return nil
}

func (r *Asset) Remove(ctx context.Context, id id.AssetID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if a, ok := r.data[id]; ok && r.f.CanWrite(a.Team()) {
		delete(r.data, id)
	}

	return nil
}
