package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/user"
)

type User struct {
	lock sync.Mutex
	data map[id.UserID]user.User
}

func NewUser() repo.User {
	return &User{
		data: map[id.UserID]user.User{},
	}
}

func (r *User) FindByIDs(ctx context.Context, ids []id.UserID) ([]*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*user.User{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			result = append(result, &d)
		} else {
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *User) FindByID(ctx context.Context, id id.UserID) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if ok {
		return &d, nil
	}
	return &user.User{}, rerror.ErrNotFound
}

func (r *User) Save(ctx context.Context, u *user.User) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[u.ID()] = *u
	return nil
}

func (r *User) FindByAuth0Sub(ctx context.Context, auth0sub string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if auth0sub == "" {
		return nil, rerror.ErrInvalidParams
	}

	for _, u := range r.data {
		if u.ContainAuth(user.AuthFromAuth0Sub(auth0sub)) {
			return &u, nil
		}
	}

	return nil, rerror.ErrNotFound
}

func (r *User) FindByPasswordResetRequest(ctx context.Context, token string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if token == "" {
		return nil, rerror.ErrInvalidParams
	}

	for _, u := range r.data {
		pwdReq := u.PasswordReset()
		if pwdReq != nil && pwdReq.Token == token {
			return &u, nil
		}
	}

	return nil, rerror.ErrNotFound
}

func (r *User) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if email == "" {
		return nil, rerror.ErrInvalidParams
	}

	for _, u := range r.data {
		if u.Email() == email {
			return &u, nil
		}
	}

	return nil, rerror.ErrNotFound
}

func (r *User) FindByName(ctx context.Context, name string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if name == "" {
		return nil, rerror.ErrInvalidParams
	}

	for _, u := range r.data {
		if u.Name() == name {
			return &u, nil
		}
	}

	return nil, rerror.ErrNotFound
}

func (r *User) FindByNameOrEmail(ctx context.Context, nameOrEmail string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if nameOrEmail == "" {
		return nil, rerror.ErrInvalidParams
	}

	for _, u := range r.data {
		if u.Email() == nameOrEmail || u.Name() == nameOrEmail {
			return &u, nil
		}
	}

	return nil, rerror.ErrNotFound
}

func (r *User) Remove(ctx context.Context, user id.UserID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	delete(r.data, user)
	return nil
}

func (r *User) FindByVerification(ctx context.Context, code string) (*user.User, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if code == "" {
		return nil, rerror.ErrInvalidParams
	}

	for _, u := range r.data {
		if u.Verification() != nil && u.Verification().Code() == code {
			return &u, nil
		}
	}

	return nil, rerror.ErrNotFound
}
