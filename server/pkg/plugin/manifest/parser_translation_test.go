package manifest

import (
	_ "embed"
	"strings"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

//go:embed testdata/translation.yml
var translatedManifest string
var expected = TranslationRoot{
	Description: lo.ToPtr("test plugin desc"),
	Extensions: map[string]TranslationExtension{
		"test_ext": {
			Name: lo.ToPtr("test ext name"),
			PropertySchema: TranslationPropertySchema{
				"test_ps": TranslationPropertySchemaGroup{
					Description: lo.ToPtr("test ps desc"),
					Fields: map[string]TranslationPropertySchemaField{
						"test_field": {
							Choices: map[string]string{
								"test_key": "test choice value"},
							Description: lo.ToPtr("test field desc"),
							Title:       lo.ToPtr("test field name"),
							Prefix:      lo.ToPtr("P"),
							Suffix:      lo.ToPtr("S"),
						},
					},
					Title: lo.ToPtr("test ps title"),
				},
			},
		},
	},
	Name:   lo.ToPtr("test plugin name"),
	Schema: nil,
}

func TestParseTranslation(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected TranslationRoot
		err      error
	}{
		{
			name:     "success create translation",
			input:    translatedManifest,
			expected: expected,
			err:      nil,
		},
		{
			name:     "fail not valid JSON",
			input:    "",
			expected: TranslationRoot{},
			err:      ErrFailedToParseManifestTranslation,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			r := strings.NewReader(tc.input)
			res, err := ParseTranslation(r)
			if tc.err != nil {
				assert.ErrorIs(t, err, tc.err)
				return
			}
			assert.Equal(t, tc.expected, res)
		})
	}
}

func TestParseTranslationFromBytes(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected TranslationRoot
		err      error
	}{
		{
			name:     "success create translation",
			input:    translatedManifest,
			expected: expected,
			err:      nil,
		},
		{
			name:     "fail not valid YAML",
			input:    "--",
			expected: TranslationRoot{},
			err:      ErrFailedToParseManifestTranslation,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			res, err := ParseTranslationFromBytes([]byte(tc.input))
			if tc.err != nil {
				assert.ErrorIs(t, err, tc.err)
				return
			}
			assert.Equal(t, tc.expected, res)
		})
	}
}

func TestMustParseTransSystemFromBytes(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected TranslationRoot
		fails    bool
	}{
		{
			name:     "success create translation",
			input:    translatedManifest,
			expected: expected,
			fails:    false,
		},
		{
			name:     "fail not valid YAML",
			input:    "--",
			expected: TranslationRoot{},
			fails:    true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			if tc.fails {
				assert.Panics(t, func() {
					_ = MustParseTranslationFromBytes([]byte(tc.input))
				})
				return
			}

			res := MustParseTranslationFromBytes([]byte(tc.input))
			assert.Equal(t, tc.expected, res)
		})
	}
}
