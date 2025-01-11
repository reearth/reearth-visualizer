package locales

import (
	"embed"
	"testing"

	"github.com/stretchr/testify/assert"
)

//go:embed en/* ja/*
var testLocales embed.FS

func TestLoadError(t *testing.T) {
	// モック用の localesJson を置き換える
	localesJson = testLocales

	tests := []struct {
		name     string
		key      string
		expected map[string]*Error
		isPanic  bool
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
			isPanic: false,
		},
		{
			name:    "Invalid key",
			key:     "pkg.project.non_existent",
			isPanic: true,
		},
		{
			name:    "Partial valid key",
			key:     "pkg.project",
			isPanic: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.isPanic {
				assert.Panics(t, func() {
					_, _ = LoadError(tt.key)
				})
			} else {
				result, err := LoadError(tt.key)
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
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
