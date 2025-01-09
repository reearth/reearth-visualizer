package locales

import "sync"

// LocalesCache now supports file-level caching
type LocalesCache struct {
	mu        sync.RWMutex
	fileCache map[string]map[string]interface{}
}

func NewLocalesCache() *LocalesCache {
	return &LocalesCache{
		fileCache: make(map[string]map[string]interface{}),
	}
}

// GetFromFileCache retrieves the entire file cache for a given language.
func (c *LocalesCache) GetFromFileCache(lang string) (map[string]interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	data, ok := c.fileCache[lang]
	return data, ok
}

// SetFileCache stores the entire file in the cache.
func (c *LocalesCache) SetFileCache(lang string, data map[string]interface{}) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.fileCache[lang] = data
}
