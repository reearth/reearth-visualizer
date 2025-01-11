package locales

import (
	"embed"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
)

//go:embed en/* ja/*
var localesJson embed.FS

// support languages
var langs = []string{"en", "ja"}

// support file types
var localesFileType = []string{"error"}

// cache for locales
var cache *LocalesCache
var loadOnce sync.Once

type Error struct {
	Code        string `json:"code"`
	Message     string `json:"message"`
	Description string `json:"description"`
}

// loadLocales
// loads locales data from the cache or file
func loadLocales() {
	cache = NewLocalesCache()
	for _, lang := range langs {
		for _, fileType := range localesFileType {
			raw, err := localesJson.ReadFile(fmt.Sprintf("%s/%s.json", lang, fileType))
			if err != nil {
				panic(err)
			}
			var data map[string]interface{}
			if err := json.Unmarshal(raw, &data); err != nil {
				panic(err)
			}
			cache.SetFileCache(lang, data)
		}
	}
}

// LoadError
// loads error data from the cache or file
// Search data by dot-delimited key
// example: "pkg.project.invalid_alias"
// basically, key is directory path error is defined
// also if key is not found, it will panic
// because we want to know if the key is not found when server starts
func LoadError(key string) (map[string]*Error, error) {
	loadOnce.Do(loadLocales)

	localesError := make(map[string]*Error)
	for _, lang := range langs {
		data, ok := cache.GetFromFileCache(lang)
		if !ok {
			loadLocales()
			data, _ = cache.GetFromFileCache(lang)
		}

		keys := strings.Split(key, ".")
		value := getNestedValue(data, keys)

		// I dare you to make a panic.
		// Because we want to know if the key is not found.
		if value == nil {
			panic(fmt.Sprintf("key not found: %s", key))
		}

		// Convert interface{} to []byte using json.Marshal
		valueBytes, err := json.Marshal(value)
		if err != nil {
			panic(err)
		}

		var result Error
		if err := json.Unmarshal(valueBytes, &result); err != nil {
			panic(err)
		}

		// check if message and description are not empty
		if result.Message == "" {
			panic(fmt.Sprintf("message not found: %s", key))
		}
		if result.Description == "" {
			panic(fmt.Sprintf("description not found: %s", key))
		}

		result.Code = keys[len(keys)-1]

		localesError[lang] = &result
	}
	return localesError, nil
}

// getNestedValue retrieves a nested value from a map given a list of keys.
func getNestedValue(data map[string]interface{}, keys []string) interface{} {
	current := data
	for _, key := range keys {
		if nested, ok := current[key].(map[string]interface{}); ok {
			current = nested
		} else if len(keys) == 1 { // last key case
			return current[key]
		} else {
			return nil // not found key case
		}
	}
	return current
}
