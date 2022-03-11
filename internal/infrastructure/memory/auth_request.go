package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/auth"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type AuthRequest struct {
	lock sync.Mutex
	data map[id.AuthRequestID]auth.Request
}

func NewAuthRequest() repo.AuthRequest {
	return &AuthRequest{
		data: map[id.AuthRequestID]auth.Request{},
	}
}

func (r *AuthRequest) FindByID(_ context.Context, id id.AuthRequestID) (*auth.Request, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if ok {
		return &d, nil
	}
	return &auth.Request{}, rerror.ErrNotFound
}

func (r *AuthRequest) FindByCode(_ context.Context, s string) (*auth.Request, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, ar := range r.data {
		if ar.GetCode() == s {
			return &ar, nil
		}
	}

	return &auth.Request{}, rerror.ErrNotFound
}

func (r *AuthRequest) FindBySubject(_ context.Context, s string) (*auth.Request, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, ar := range r.data {
		if ar.GetSubject() == s {
			return &ar, nil
		}
	}

	return &auth.Request{}, rerror.ErrNotFound
}

func (r *AuthRequest) Save(_ context.Context, request *auth.Request) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[request.ID()] = *request
	return nil
}

func (r *AuthRequest) Remove(_ context.Context, requestID id.AuthRequestID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	delete(r.data, requestID)
	return nil
}
