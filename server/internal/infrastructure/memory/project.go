package memory

import (
	"context"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type Project struct {
	lock sync.Mutex
	data map[id.ProjectID]*project.Project
	f    repo.WorkspaceFilter
}

func NewProject() repo.Project {
	return &Project{
		data: map[id.ProjectID]*project.Project{},
	}
}

func (r *Project) Filtered(f repo.WorkspaceFilter) repo.Project {
	return &Project{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Project) FindByWorkspace(ctx context.Context, id accountdomain.WorkspaceID, filter repo.ProjectFilter) ([]*project.Project, *usecasex.PageInfo, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if !r.f.CanRead(id) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	result := []*project.Project{}
	for _, d := range r.data {
		if d.Workspace() == id && !d.IsDeleted() && d.CoreSupport() && (filter.Keyword == nil || strings.Contains(d.Name(), *filter.Keyword)) {
			result = append(result, d)
		}
	}

	if filter.Sort != nil {
		s := *filter.Sort
		sort.SliceStable(result, func(i, j int) bool {
			switch s {
			case project.SortTypeID:
				return result[i].ID().Compare(result[j].ID()) < 0
			case project.SortTypeUpdatedAt:
				return result[i].UpdatedAt().Before(result[j].UpdatedAt())
			case project.SortTypeName:
				return strings.Compare(strings.ToLower(result[i].Name()), strings.ToLower(result[j].Name())) < 0
			default:
				return false
			}
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

func (r *Project) FindStarredByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) ([]*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if !r.f.CanRead(id) {
		return nil, nil
	}

	var result []*project.Project
	for _, p := range r.data {
		if p.Workspace() == id && p.Starred() && p.CoreSupport() {
			result = append(result, p)
		}
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].UpdatedAt().After(result[j].UpdatedAt())
	})

	return result, nil
}

func (r *Project) FindDeletedByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) ([]*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if !r.f.CanRead(id) {
		return nil, nil
	}

	var result []*project.Project
	for _, p := range r.data {
		if p.Workspace() == id && p.IsDeleted() && p.CoreSupport() {
			result = append(result, p)
		}
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].UpdatedAt().After(result[j].UpdatedAt())
	})

	return result, nil
}

func (r *Project) FindActiveById(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	for _, p := range r.data {
		if p.ID() == id && !p.IsDeleted() {
			return p, nil
		}
	}
	return nil, nil
}

func (r *Project) FindVisibilityByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) ([]*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	var result []*project.Project
	if r.f.Readable == nil || !r.f.Readable.Has(id) {
		for _, p := range r.data {
			if p.Workspace() == id && !p.IsDeleted() && p.Visibility() == "public" {
				result = append(result, p)
			}
		}

		sort.Slice(result, func(i, j int) bool {
			return result[i].UpdatedAt().After(result[j].UpdatedAt())
		})

	}

	for _, p := range r.data {
		if p.Workspace() == id && !p.IsDeleted() {
			result = append(result, p)
		}
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].UpdatedAt().After(result[j].UpdatedAt())
	})

	return result, nil
}

func (r *Project) FindIDsByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) (res []id.ProjectID, _ error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if !r.f.CanRead(id) {
		return nil, nil
	}

	for _, d := range r.data {
		if d.Workspace() == id {
			res = append(res, d.ID())
		}
	}
	return
}

func (r *Project) FindByIDs(ctx context.Context, ids id.ProjectIDList) ([]*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*project.Project{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Workspace()) {
			result = append(result, d)
			continue
		}
		result = append(result, nil)
	}
	return result, nil
}

func (r *Project) FindByID(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, ok := r.data[id]; ok && r.f.CanRead(p.Workspace()) {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) FindByScene(_ context.Context, sId id.SceneID) (*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, d := range r.data {
		if d.Scene() == sId && r.f.CanRead(d.Workspace()) {
			return d, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) FindByPublicName(ctx context.Context, name string) (*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if name == "" {
		return nil, nil
	}
	for _, p := range r.data {
		if p.MatchWithPublicName(name) {
			return p, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) CheckAliasUnique(ctx context.Context, name string) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, p := range r.data {
		if p.ID().String() == name || p.Alias() == name {
			return alias.ErrExistsStorytellingAlias
		}
	}

	return nil
}

func (r *Project) CountByWorkspace(_ context.Context, ws accountdomain.WorkspaceID) (n int, _ error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, p := range r.data {
		if p.Workspace() == ws && r.f.CanRead(p.Workspace()) {
			n++
		}
	}
	return
}

func (r *Project) CountPublicByWorkspace(_ context.Context, ws accountdomain.WorkspaceID) (n int, _ error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, p := range r.data {
		if p.Workspace() == ws && r.f.CanRead(p.Workspace()) && p.PublishmentStatus() == project.PublishmentStatusPublic {
			n++
		}
	}
	return
}

func (r *Project) Save(ctx context.Context, p *project.Project) error {
	if !r.f.CanWrite(p.Workspace()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	p.SetUpdatedAt(time.Now())
	r.data[p.ID()] = p
	return nil
}

func (r *Project) Remove(ctx context.Context, id id.ProjectID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, ok := r.data[id]; ok && r.f.CanRead(p.Workspace()) {
		delete(r.data, id)
	}
	return nil
}
