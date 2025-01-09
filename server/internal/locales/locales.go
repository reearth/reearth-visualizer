package locales

import (
	"embed"
	"encoding/json"
	"fmt"
	"strings"
)

//go:embed en/* ja/*
var localesJson embed.FS

// support languages
var langs = []string{"en", "ja"}

// support file types
var localesFileType = []string{"error"}

// cache for locales
var cache *LocalesCache

type Error struct {
	Code        string `json:"code"`
	Message     string `json:"message"`
	Description string `json:"description"`
}

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

// LoadError loads error data from the cache or file
// Search data by dot-delimited key
// example: "pkg.project.invalid_alias"
// basically, key is directory path error is defined
func LoadError(key string) (map[string]*Error, error) {
	if cache == nil {
		loadLocales()
	}

	localesError := make(map[string]*Error)
	for _, lang := range langs {
		data, ok := cache.GetFromFileCache(lang)
		if !ok {
			loadLocales()
			data, _ = cache.GetFromFileCache(lang)
		}

		value := getNestedValue(data, strings.Split(key, "."))

		// I dare you to make a panic.
		// Because we want to know if the key is not found.
		if value == nil {
			panic(fmt.Sprintf("key not found: %s", key))
		}

		// Convert interface{} to []byte using json.Marshal
		valueBytes, err := json.Marshal(value)
		if err != nil {
			return nil, err
		}

		var result Error
		if err := json.Unmarshal(valueBytes, &result); err != nil {
			return nil, err
		}

		localesError[lang] = &result
	}
	return localesError, nil
}

// getNestedValue retrieves a nested value from a map given a list of keys.
func getNestedValue(data map[string]interface{}, keys []string) interface{} {
	current := data
	for _, key := range keys {
		// map[string]interface{} 型であることを確認しつつ検索を進める
		if nested, ok := current[key].(map[string]interface{}); ok {
			current = nested
		} else if len(keys) == 1 { // 最終キーの場合
			return current[key]
		} else {
			return nil // 存在しないキーの場合
		}
	}
	return current
}
