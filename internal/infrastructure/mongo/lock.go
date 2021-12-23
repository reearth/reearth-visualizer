package mongo

import (
	"context"
	"errors"
	"math/rand"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"
	lock "github.com/square/mongo-lock"
	"go.mongodb.org/mongo-driver/mongo"
)

type Lock struct {
	l      *lock.Client
	hostid string
	locks  sync.Map
}

func NewLock(c *mongo.Collection) (repo.Lock, error) {
	hostid, err := uuidString()
	if err != nil {
		return nil, err
	}

	l := lock.NewClient(c)
	if err := l.CreateIndexes(context.Background()); err != nil {
		return nil, err
	}

	return &Lock{
		l:      l,
		hostid: hostid,
	}, nil
}

func (r *Lock) Lock(ctx context.Context, name string) error {
	if r.getLockID(name) != "" {
		return repo.ErrAlreadyLocked
	}

	lockID, err := uuidString()
	if err != nil {
		return err
	}

	log.Infof("lock: trying to lock: id=%s, name=%s, host=%s", name, lockID, r.hostid)
	// wait and retry
	const retry = 10
	for i := 0; i < retry; i++ {
		if err := r.l.XLock(ctx, name, lockID, r.details()); err != nil {
			if errors.Is(err, lock.ErrAlreadyLocked) {
				log.Infof("lock: failed to lock (%d/%d): name=%s, id=%s, host=%s", i+1, retry, name, lockID, r.hostid)
				if i >= retry {
					return repo.ErrFailedToLock
				}

				time.Sleep(time.Second * time.Duration(rand.Intn(1)+(i+1)))
				continue
			}

			log.Infof("lock: failed to lock: name=%s, id=%s, host=%s, err=%s", name, lockID, r.hostid, err)
			return repo.ErrFailedToLock
		} else {
			break
		}
	}

	r.setLockID(name, lockID)
	log.Infof("lock: locked: name=%s, id=%s, host=%s", name, lockID, r.hostid)
	return nil
}

func (r *Lock) Unlock(ctx context.Context, name string) error {
	lockID := r.getLockID(name)
	if lockID == "" {
		return repo.ErrNotLocked
	}

	if _, err := r.l.Unlock(ctx, lockID); err != nil {
		return rerror.ErrInternalBy(err)
	}

	r.deleteLockID(name)
	log.Infof("lock: unlocked: name=%s, id=%s, host=%s", name, lockID, r.hostid)
	return nil
}

func uuidString() (string, error) {
	u, err := uuid.NewUUID()
	if err != nil {
		return "", rerror.ErrInternalBy(err)
	}

	return u.String(), nil
}

func (r *Lock) details() lock.LockDetails {
	if r == nil {
		return lock.LockDetails{}
	}

	return lock.LockDetails{
		Host: r.hostid,
		TTL:  60 * 60, // 1 hour
	}
}

func (r *Lock) setLockID(key, lockID string) {
	if r == nil {
		return
	}

	r.locks.Store(key, lockID)
}

func (r *Lock) getLockID(key string) string {
	if r == nil {
		return ""
	}

	l, ok := r.locks.Load(key)
	if !ok {
		return ""
	}

	return l.(string)
}

func (r *Lock) deleteLockID(key string) {
	if r == nil {
		return
	}

	r.locks.Delete(key)
}
