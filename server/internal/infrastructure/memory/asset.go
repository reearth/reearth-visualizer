package memory

import (
	"context"
	"sort"
	"strings"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
)

type Asset struct {
	data *util.SyncMap[id.AssetID, *asset.Asset]
	f    repo.WorkspaceFilter
}

func NewAsset() *Asset {
	return &Asset{
		data: util.SyncMapFrom[id.AssetID, *asset.Asset](nil),
	}
}

func (r *Asset) Filtered(f repo.WorkspaceFilter) repo.Asset {
	return &Asset{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Asset) FindByID(_ context.Context, id id.AssetID) (*asset.Asset, error) {
	d, ok := r.data.Load(id)
	if ok && r.f.CanRead(d.Workspace()) {
		return d, nil
	}
	return &asset.Asset{}, rerror.ErrNotFound
}

func (r *Asset) FindByIDs(_ context.Context, ids id.AssetIDList) ([]*asset.Asset, error) {
	return r.data.FindAll(func(k id.AssetID, v *asset.Asset) bool {
		return ids.Has(k) && r.f.CanRead(v.Workspace())
	}), nil
}

func (r *Asset) FindByWorkspace(_ context.Context, wid accountdomain.WorkspaceID, filter repo.AssetFilter) ([]*asset.Asset, *usecasex.PageInfo, error) {
	if !r.f.CanRead(wid) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	result := r.data.FindAll(func(k id.AssetID, v *asset.Asset) bool {
		return v.Workspace() == wid && (filter.Keyword == nil || strings.Contains(v.Name(), *filter.Keyword))
	})

	if filter.Sort != nil {
		s := *filter.Sort
		sort.SliceStable(result, func(i, j int) bool {
			if s == asset.SortTypeID {
				return result[i].ID().Compare(result[j].ID()) < 0
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

	var startCursor, endCursor *usecasex.Cursor
	if len(result) > 0 {
		_startCursor := usecasex.Cursor(result[0].ID().String())
		_endCursor := usecasex.Cursor(result[len(result)-1].ID().String())
		startCursor = &_startCursor
		endCursor = &_endCursor
	}

	return result, usecasex.NewPageInfo(
		int64(len(result)),
		startCursor,
		endCursor,
		true,
		true,
	), nil
}

func (r *Asset) TotalSizeByWorkspace(_ context.Context, wid accountdomain.WorkspaceID) (t int64, err error) {
	if !r.f.CanRead(wid) {
		return 0, nil
	}

	r.data.Range(func(k id.AssetID, v *asset.Asset) bool {
		if v.Workspace() == wid {
			t += v.Size()
		}
		return true
	})
	return
}

func (r *Asset) Save(_ context.Context, a *asset.Asset) error {
	if !r.f.CanWrite(a.Workspace()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(a.ID(), a)
	return nil
}

func (r *Asset) Remove(_ context.Context, id id.AssetID) error {
	a, _ := r.data.Load(id)
	if a == nil {
		return nil
	}

	if !r.f.CanWrite(a.Workspace()) {
		return repo.ErrOperationDenied
	}

	r.data.Delete(id)
	return nil
}
