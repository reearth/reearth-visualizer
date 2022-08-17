package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/rerror"
)

type Workspace struct {
	lock sync.Mutex
	data map[id.WorkspaceID]*workspace.Workspace
}

func NewWorkspace() repo.Workspace {
	return &Workspace{
		data: map[id.WorkspaceID]*workspace.Workspace{},
	}
}

func (r *Workspace) FindByUser(ctx context.Context, i id.UserID) (workspace.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := workspace.List{}
	for _, d := range r.data {
		if d.Members().ContainsUser(i) {
			result = append(result, d)
		}
	}
	return result, nil
}

func (r *Workspace) FindByIDs(ctx context.Context, ids id.WorkspaceIDList) (workspace.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := workspace.List{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			result = append(result, d)
		} else {
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *Workspace) FindByID(ctx context.Context, id id.WorkspaceID) (*workspace.Workspace, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if ok {
		return d, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Workspace) Save(ctx context.Context, t *workspace.Workspace) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[t.ID()] = t
	return nil
}

func (r *Workspace) SaveAll(ctx context.Context, workspaces []*workspace.Workspace) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, t := range workspaces {
		r.data[t.ID()] = t
	}
	return nil
}

func (r *Workspace) Remove(ctx context.Context, id id.WorkspaceID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	delete(r.data, id)
	return nil
}

func (r *Workspace) RemoveAll(ctx context.Context, ids id.WorkspaceIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, id := range ids {
		delete(r.data, id)
	}
	return nil
}
