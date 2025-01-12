package locales

import (
	"embed"
	"fmt"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
)

//go:embed en/* ja/*
var testLocales embed.FS

func TestLoadLocales_FileNotFound(t *testing.T) {
	cache = nil
	loadOnce = sync.Once{}

	t.Cleanup(func() {
		cache = nil
		loadOnce = sync.Once{}
	})

	defer func() {
		if r := recover(); r != nil {
			assert.Equal(t, "open aaa/error.json: file does not exist", fmt.Sprintf("%v", r))
		} else {
			t.Fatal("Expected panic but it did not occur")
		}
	}()

	loadLocales([]string{"aaa"}, []string{"error"})
}

func TestLoadError(t *testing.T) {
	localesJson = testLocales

	tests := []struct {
		name     string
		key      ErrorKey
		expected map[string]*Error
		err      error
	}{
		{
			name: "Valid key",
			key:  "pkg.project.invalid_alias",
			expected: map[string]*Error{
				"en": {
					Code:        "invalid_alias",
					Message:     "Invalid alias name",
					Description: "The alias must be 5-32 characters long and can only contain alphanumeric characters, underscores, and hyphens.",
				},
				"ja": {
					Code:        "invalid_alias",
					Message:     "無効なエイリアス名です。",
					Description: "エイリアスは5-32文字で、英数字、アンダースコア、ハイフンのみ使用できます。",
				},
			},
			err: nil,
		},
		{
			name:     "Invalid key",
			key:      "pkg.project.non_existent",
			expected: nil,
			err:      fmt.Errorf("key not found: pkg.project.non_existent"),
		},
		{
			name:     "Partial valid key",
			key:      "pkg.project",
			expected: nil,
			err:      fmt.Errorf("message not found: pkg.project"),
		},
		{
			name:     "Empty key",
			key:      "",
			expected: nil,
			err:      fmt.Errorf("invalid key: empty string"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := LoadError(tt.key)
			if tt.err != nil {
				assert.Equal(t, err.Error(), tt.err.Error())
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGetNestedValue(t *testing.T) {
	mockData := map[string]interface{}{
		"pkg": map[string]interface{}{
			"project": map[string]interface{}{
				"invalid_alias": map[string]interface{}{
					"code":        "invalid_alias",
					"message":     "Invalid alias name",
					"description": "The alias must be 5-32 characters long and can only contain alphanumeric characters, underscores, and hyphens.",
				},
			},
		},
	}

	tests := []struct {
		name     string
		keys     []string
		expected interface{}
	}{
		{
			name:     "Valid nested key",
			keys:     []string{"pkg", "project", "invalid_alias"},
			expected: map[string]interface{}{"code": "invalid_alias", "message": "Invalid alias name", "description": "The alias must be 5-32 characters long and can only contain alphanumeric characters, underscores, and hyphens."},
		},
		{
			name:     "Invalid key",
			keys:     []string{"pkg", "non_existent"},
			expected: nil,
		},
		{
			name:     "Partial valid key",
			keys:     []string{"pkg", "project"},
			expected: map[string]interface{}{"invalid_alias": map[string]interface{}{"code": "invalid_alias", "message": "Invalid alias name", "description": "The alias must be 5-32 characters long and can only contain alphanumeric characters, underscores, and hyphens."}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getNestedValue(mockData, tt.keys)
			assert.Equal(t, tt.expected, result)
		})
	}
}
