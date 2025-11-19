package memory

import (
	"context"
	"sync"

	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearthx/rerror"
)

// AccountsUserRepo is a simple in-memory repository for reearth-accounts users
// This is used for mock authentication mode only
type AccountsUserRepo struct {
	users map[string]*accountsUser.User
	mu    sync.RWMutex
}

func NewAccountsUserRepo() *AccountsUserRepo {
	return &AccountsUserRepo{
		users: make(map[string]*accountsUser.User),
	}
}

func (r *AccountsUserRepo) Create(_ context.Context, user *accountsUser.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if user == nil {
		return rerror.ErrInvalidParams
	}

	r.users[user.ID().String()] = user
	return nil
}

func (r *AccountsUserRepo) FindByID(_ context.Context, id accountsUser.ID) (*accountsUser.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, ok := r.users[id.String()]
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return user, nil
}

func (r *AccountsUserRepo) FindByNameOrEmail(_ context.Context, nameOrEmail string) (*accountsUser.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, user := range r.users {
		if user.Name() == nameOrEmail || user.Email() == nameOrEmail {
			return user, nil
		}
	}
	return nil, rerror.ErrNotFound
}
