package app

import (
	"context"
	"sync"
	"time"

	"github.com/vektah/gqlparser/v2/ast"
)

type Cache struct {
	data sync.Map
	ttl  time.Duration
}

type cacheItem struct {
	value      interface{}
	expiration time.Time
}

func NewCache(ttl time.Duration) *Cache {
	return &Cache{ttl: ttl}
}

func (c *Cache) Add(ctx context.Context, key string, value *ast.QueryDocument) {
	c.data.Store(key, cacheItem{
		value:      value,
		expiration: time.Now().Add(c.ttl),
	})
}

func (c *Cache) Get(ctx context.Context, key string) (*ast.QueryDocument, bool) {
	item, ok := c.data.Load(key)
	if !ok {
		return nil, false
	}
	cachedItem := item.(cacheItem)
	if time.Now().After(cachedItem.expiration) {
		c.data.Delete(key)
		return nil, false
	}
	value, ok := cachedItem.value.(*ast.QueryDocument)
	if !ok {
		c.data.Delete(key)
		return nil, false
	}
	return value, true
}

type PersistedCache struct {
	data sync.Map
	ttl  time.Duration
}

func NewPersistedCache(ttl time.Duration) *PersistedCache {
	return &PersistedCache{ttl: ttl}
}

func (c *PersistedCache) Add(ctx context.Context, key string, value string) {
	c.data.Store(key, cacheItem{
		value:      value,
		expiration: time.Now().Add(c.ttl),
	})
}

func (c *PersistedCache) Get(ctx context.Context, key string) (string, bool) {
	item, ok := c.data.Load(key)
	if !ok {
		return "", false
	}
	cachedItem := item.(cacheItem)
	if time.Now().After(cachedItem.expiration) {
		c.data.Delete(key)
		return "", false
	}
	value, ok := cachedItem.value.(string)
	if !ok {
		c.data.Delete(key)
		return "", false
	}
	return value, true
}
