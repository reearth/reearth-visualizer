package repo

import (
	"context"
	"errors"
)

var (
	ErrFailedToLock  = errors.New("failed to lock")
	ErrAlreadyLocked = errors.New("already locked")
	ErrNotLocked     = errors.New("not locked")
)

type Lock interface {
	Lock(context.Context, string) error
	Unlock(context.Context, string) error
}
