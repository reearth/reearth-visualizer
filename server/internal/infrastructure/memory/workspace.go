package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/repo"
	"github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type Workspace struct {
	lock sync.Mutex
	data map[id.WorkspaceID]*workspace.Workspace
	f    repo.WorkspaceFilter
}

func NewWorkspace() repo.Workspace {
	return &Workspace{
		data: map[id.WorkspaceID]*workspace.Workspace{},
	}
}

func (r *Workspace) Filtered(f repo.WorkspaceFilter) repo.Workspace {
	return &Workspace{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Workspace) FindByID(ctx context.Context, wid id.WorkspaceID) (*workspace.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	w, ok := r.data[wid]
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return w, nil
}

func (r *Workspace) FindByName(ctx context.Context, name string) (*workspace.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, w := range r.data {
		if w.Name() == name {
			return w, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Workspace) FindByAlias(ctx context.Context, alias string) (*workspace.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, w := range r.data {
		if w.Alias() == alias {
			return w, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Workspace) FindByIDs(ctx context.Context, ids id.WorkspaceIDList) ([]*workspace.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	workspaces := make([]*workspace.Workspace, 0, len(ids))
	for _, wid := range ids {
		if w, ok := r.data[wid]; ok {
			workspaces = append(workspaces, w)
		}
	}
	return workspaces, nil
}

func (r *Workspace) FindByUser(ctx context.Context, uid id.UserID) ([]*workspace.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	workspaces := make([]*workspace.Workspace, 0)
	for _, w := range r.data {
		if w.Members().HasUser(uid) {
			workspaces = append(workspaces, w)
		}
	}
	return workspaces, nil
}

func (r *Workspace) FindByUserWithPagination(ctx context.Context, uid id.UserID, pagination *usecasex.Pagination) ([]*workspace.Workspace, *usecasex.PageInfo, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	workspaces := make([]*workspace.Workspace, 0)
	for _, w := range r.data {
		if w.Members().HasUser(uid) {
			workspaces = append(workspaces, w)
		}
	}

	return workspaces, &usecasex.PageInfo{
		TotalCount: int64(len(workspaces)),
	}, nil
}

func (r *Workspace) FindByIntegration(ctx context.Context, iid id.IntegrationID) ([]*workspace.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	workspaces := make([]*workspace.Workspace, 0)
	for _, w := range r.data {
		if w.Members().HasIntegration(iid) {
			workspaces = append(workspaces, w)
		}
	}
	return workspaces, nil
}

func (r *Workspace) FindByIntegrations(ctx context.Context, iids id.IntegrationIDList) ([]*workspace.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	workspaces := make([]*workspace.Workspace, 0)
	for _, w := range r.data {
		for _, iid := range iids {
			if w.Members().HasIntegration(iid) {
				workspaces = append(workspaces, w)
				break
			}
		}
	}
	return workspaces, nil
}

func (r *Workspace) CheckWorkspaceAliasUnique(ctx context.Context, wid id.WorkspaceID, alias string) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, w := range r.data {
		if w.ID() != wid && w.Alias() == alias {
			return rerror.ErrAlreadyExists
		}
	}
	return nil
}

func (r *Workspace) Create(ctx context.Context, w *workspace.Workspace) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if _, ok := r.data[w.ID()]; ok {
		return rerror.ErrAlreadyExists
	}
	r.data[w.ID()] = w
	return nil
}

func (r *Workspace) Save(ctx context.Context, w *workspace.Workspace) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[w.ID()] = w
	return nil
}

func (r *Workspace) SaveAll(ctx context.Context, workspaces []*workspace.Workspace) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, w := range workspaces {
		r.data[w.ID()] = w
	}
	return nil
}

func (r *Workspace) Remove(ctx context.Context, wid id.WorkspaceID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if _, ok := r.data[wid]; !ok {
		return rerror.ErrNotFound
	}
	delete(r.data, wid)
	return nil
}

func (r *Workspace) RemoveAll(ctx context.Context, ids id.WorkspaceIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, wid := range ids {
		delete(r.data, wid)
	}
	return nil
}
