package cache

import (
	"context"
	"sync"
	"time"
)

// Cache holds data can be accessed synchronously. The data will be automatically updated when it expires.
type Cache[T any] struct {
	updater   func(context.Context, T) (T, error)
	expiresIn time.Duration
	updatedAt time.Time
	lock      sync.Mutex
	data      T
	now       func() time.Time
}

func New[T any](updater func(context.Context, T) (T, error), expiresIn time.Duration) *Cache[T] {
	return &Cache[T]{updater: updater, expiresIn: expiresIn}
}

func (c *Cache[T]) Get(ctx context.Context) (res T, _ error) {
	if c == nil {
		return
	}

	c.lock.Lock()
	defer c.lock.Unlock()

	if c.updatedAt.IsZero() || c.updatedAt.Add(c.expiresIn).Before(c.currentTime()) {
		if err := c.update(ctx); err != nil {
			return c.data, err
		}
	}
	return c.data, nil
}

func (c *Cache[T]) update(ctx context.Context) error {
	var err error
	data, err := c.updater(ctx, c.data)
	if err != nil {
		return err
	}

	c.data = data
	c.updatedAt = c.currentTime()
	return nil
}

func (c *Cache[T]) currentTime() time.Time {
	if c.now == nil {
		return time.Now()
	}
	return c.now()
}
