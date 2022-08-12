package cache

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCache_Get(t *testing.T) {
	ctx := context.Background()
	data := &struct{}{}
	err := errors.New("err!")
	var cache *Cache[*struct{}]
	called := 0

	res, e := cache.Get(ctx) // nil cache
	assert.NoError(t, e)
	assert.Nil(t, res)

	cache = New(func(c context.Context, i *struct{}) (*struct{}, error) {
		assert.Same(t, ctx, c)
		if called == 0 {
			assert.Nil(t, i)
		} else {
			assert.Same(t, cache.data, i)
		}
		called++
		if called == 3 {
			return data, err
		}
		return data, nil
	}, time.Duration(0)) // duration 0 means data will be updated every time

	res, e = cache.Get(ctx) // first
	assert.NoError(t, e)
	assert.Same(t, data, res)
	assert.Equal(t, 1, called)

	res, e = cache.Get(ctx) // second
	assert.NoError(t, e)
	assert.Same(t, data, res)
	assert.Equal(t, 2, called)

	res, e = cache.Get(ctx) // third
	assert.Same(t, err, e)
	assert.Same(t, data, res)
	assert.Equal(t, 3, called)
}

func TestCache_Get2(t *testing.T) {
	ctx := context.Background()
	data := &struct{}{}
	now := time.Date(2022, 6, 4, 0, 0, 0, 0, time.UTC)
	called := 0

	cache := New(func(_ context.Context, _ *struct{}) (*struct{}, error) {
		called++
		return data, nil
	}, time.Second)
	cache.now = func() time.Time { return now }

	assert.Equal(t, 0, called)
	_, _ = cache.Get(ctx)
	assert.Equal(t, 1, called)
	_, _ = cache.Get(ctx)
	assert.Equal(t, 1, called)
	now = now.Add(time.Millisecond)
	_, _ = cache.Get(ctx)
	assert.Equal(t, 1, called)
	now = now.Add(time.Second)
	_, _ = cache.Get(ctx)
	assert.Equal(t, 2, called)
	_, _ = cache.Get(ctx)
	assert.Equal(t, 2, called)
	now = now.Add(time.Second * 2)
	_, _ = cache.Get(ctx)
	assert.Equal(t, 3, called)
}
