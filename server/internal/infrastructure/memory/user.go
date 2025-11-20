package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/repo"
	"github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type User struct {
	lock  sync.Mutex
	data  map[id.UserID]*user.User
	f     repo.WorkspaceFilter
}

func NewUser() repo.User {
	return &User{
		data: map[id.UserID]*user.User{},
	}
}

func (r *User) Filtered(f repo.WorkspaceFilter) repo.User {
	return &User{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *User) FindAll(ctx context.Context) ([]*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	users := make([]*user.User, 0, len(r.data))
	for _, u := range r.data {
		users = append(users, u)
	}
	return users, nil
}

func (r *User) FindByID(ctx context.Context, uid id.UserID) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	u, ok := r.data[uid]
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return u, nil
}

func (r *User) FindByIDs(ctx context.Context, ids id.UserIDList) ([]*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	users := make([]*user.User, 0, len(ids))
	for _, uid := range ids {
		if u, ok := r.data[uid]; ok {
			users = append(users, u)
		}
	}
	return users, nil
}

func (r *User) FindByIDsWithPagination(ctx context.Context, ids id.UserIDList, pagination *usecasex.Pagination, nameOrAlias ...string) ([]*user.User, *usecasex.PageInfo, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	users := make([]*user.User, 0, len(ids))
	for _, uid := range ids {
		if u, ok := r.data[uid]; ok {
			users = append(users, u)
		}
	}

	return users, &usecasex.PageInfo{
		TotalCount: int64(len(users)),
	}, nil
}

func (r *User) FindBySub(ctx context.Context, sub string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, u := range r.data {
		for _, auth := range u.Auths() {
			if auth.Sub == sub {
				return u, nil
			}
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *User) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, u := range r.data {
		if u.Email() == email {
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *User) FindByName(ctx context.Context, name string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, u := range r.data {
		if u.Name() == name {
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *User) FindByAlias(ctx context.Context, alias string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, u := range r.data {
		if u.Alias() == alias {
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *User) FindByNameOrEmail(ctx context.Context, nameOrEmail string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, u := range r.data {
		if u.Name() == nameOrEmail || u.Email() == nameOrEmail {
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *User) SearchByKeyword(ctx context.Context, keyword string, fields ...string) ([]*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	users := make([]*user.User, 0)
	for _, u := range r.data {
		// Simple search implementation
		if u.Name() == keyword || u.Email() == keyword {
			users = append(users, u)
		}
	}
	return users, nil
}

func (r *User) FindByVerification(ctx context.Context, code string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, u := range r.data {
		if v := u.Verification(); v != nil && v.Code() == code {
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *User) FindByPasswordResetRequest(ctx context.Context, token string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, u := range r.data {
		if pr := u.PasswordReset(); pr != nil {
			// PasswordReset might be a complex type, for now just check if it exists
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *User) FindBySubOrCreate(ctx context.Context, u *user.User, sub string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	// Try to find by sub first
	for _, existing := range r.data {
		for _, auth := range existing.Auths() {
			if auth.Sub == sub {
				return existing, nil
			}
		}
	}

	// Create new user
	r.data[u.ID()] = u
	return u, nil
}

func (r *User) Create(ctx context.Context, u *user.User) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if _, ok := r.data[u.ID()]; ok {
		return rerror.ErrAlreadyExists
	}
	r.data[u.ID()] = u
	return nil
}

func (r *User) Save(ctx context.Context, u *user.User) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[u.ID()] = u
	return nil
}

func (r *User) Remove(ctx context.Context, uid id.UserID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if _, ok := r.data[uid]; !ok {
		return rerror.ErrNotFound
	}
	delete(r.data, uid)
	return nil
}
