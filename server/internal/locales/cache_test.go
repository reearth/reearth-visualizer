package locales

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLocalesCache(t *testing.T) {
	// Create a new cache instance
	cache := NewLocalesCache()

	// Mock data for testing
	mockDataEN := map[string]interface{}{
		"hello": "Hello",
		"world": "World",
	}

	mockDataJA := map[string]interface{}{
		"hello": "こんにちは",
		"world": "世界",
	}

	t.Run("SetFileCache and GetFromFileCache for single language", func(t *testing.T) {
		// Set mock data for "en"
		cache.SetFileCache("en", mockDataEN)

		// Retrieve the data
		data, ok := cache.GetFromFileCache("en")

		// Assertions
		assert.True(t, ok, "Expected data to be found in cache for language 'en'")
		assert.Equal(t, mockDataEN, data, "Expected cached data for 'en' to match mock data")
	})

	t.Run("SetFileCache and GetFromFileCache for multiple languages", func(t *testing.T) {
		// Set mock data for "en" and "ja"
		cache.SetFileCache("en", mockDataEN)
		cache.SetFileCache("ja", mockDataJA)

		// Retrieve data for "en"
		dataEN, okEN := cache.GetFromFileCache("en")
		assert.True(t, okEN, "Expected data to be found in cache for language 'en'")
		assert.Equal(t, mockDataEN, dataEN, "Expected cached data for 'en' to match mock data")

		// Retrieve data for "ja"
		dataJA, okJA := cache.GetFromFileCache("ja")
		assert.True(t, okJA, "Expected data to be found in cache for language 'ja'")
		assert.Equal(t, mockDataJA, dataJA, "Expected cached data for 'ja' to match mock data")
	})

	t.Run("GetFromFileCache for non-existent language", func(t *testing.T) {
		// Attempt to get data for a language that was not set
		data, ok := cache.GetFromFileCache("fr")

		// Assertions
		assert.False(t, ok, "Expected data not to be found in cache for language 'fr'")
		assert.Nil(t, data, "Expected nil data for language 'fr'")
	})
}
