package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/auth"
	"github.com/reearth/reearth-backend/pkg/id"
)

type AuthRequest interface {
	FindByID(context.Context, id.AuthRequestID) (*auth.Request, error)
	FindByCode(context.Context, string) (*auth.Request, error)
	FindBySubject(context.Context, string) (*auth.Request, error)
	Save(context.Context, *auth.Request) error
	Remove(context.Context, id.AuthRequestID) error
}
