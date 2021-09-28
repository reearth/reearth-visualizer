package manifest

import (
	_ "embed"
	"strings"
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

//go:embed testdata/translation.yml
var translatedManifest string
var expected = &TranslationRoot{
	Description: sr("test plugin desc"),
	Extensions: map[string]TranslationExtension{
		"test_ext": {
			Name: sr("test ext name"),
			PropertySchema: TranslationPropertySchema{
				"test_ps": TranslationPropertySchemaGroup{
					Description: sr("test ps desc"),
					Fields: map[string]TranslationPropertySchemaField{
						"test_field": {
							Choices: map[string]string{
								"test_key": "test choice value"},
							Description: sr("test field desc"),
							Title:       sr("test field name"),
						},
					},
					Title: sr("test ps title"),
				},
			},
		},
	},
	Name:   sr("test plugin name"),
	Schema: nil,
}

//go:embed testdata/translation_merge.yml
var mergeManifest string

func TestParseTranslation(t *testing.T) {
	testCases := []struct {
		name     string
		input    string
		expected *TranslationRoot
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
			expected: nil,
			err:      ErrFailedToParseManifestTranslation,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			r := strings.NewReader(tc.input)
			res, err := ParseTranslation(r)
			if tc.err != nil {
				assert.ErrorIs(tt, err, tc.err)
				return
			}
			assert.Equal(tt, tc.expected, res)
		})
	}
}

func TestParseTranslationFromBytes(t *testing.T) {
	testCases := []struct {
		name     string
		input    string
		expected *TranslationRoot
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
			expected: nil,
			err:      ErrFailedToParseManifestTranslation,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res, err := ParseTranslationFromBytes([]byte(tc.input))
			if tc.err != nil {
				assert.ErrorIs(tt, err, tc.err)
				return
			}
			assert.Equal(tt, tc.expected, res)
		})
	}
}

func TestMustParseTransSystemFromBytes(t *testing.T) {
	testCases := []struct {
		name     string
		input    string
		expected *TranslationRoot
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
			expected: nil,
			err:      ErrFailedToParseManifestTranslation,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			if tc.err != nil {
				assert.PanicsWithError(tt, tc.err.Error(), func() {
					_ = MustParseTranslationFromBytes([]byte(tc.input))
				})
				return
			}

			res := MustParseTranslationFromBytes([]byte(tc.input))
			assert.Equal(tt, tc.expected, res)
		})
	}
}

func TestMergeManifestTranslation(t *testing.T) {
	testCases := []struct {
		Name         string
		Translations map[string]*TranslationRoot
		Manifest     *Manifest
		Expected     *struct {
			PluginName, PluginDesc, ExtName, PsTitle, FieldTitle, FieldDesc i18n.String
		}
	}{
		{
			Name:         "nil translition list",
			Translations: nil,
			Manifest:     nil,
			Expected:     nil,
		},
		{
			Name:         "nil translition list",
			Translations: map[string]*TranslationRoot{"xx": MustParseTranslationFromBytes([]byte(translatedManifest))},
			Manifest:     MustParseSystemFromBytes([]byte(mergeManifest), nil),
			Expected: &struct{ PluginName, PluginDesc, ExtName, PsTitle, FieldTitle, FieldDesc i18n.String }{
				PluginName: i18n.String{"en": "aaa", "xx": "test plugin name"},
				PluginDesc: i18n.String{"en": "ddd", "xx": "test plugin desc"},
				ExtName:    i18n.String{"en": "ttt", "xx": "test ext name"},
				PsTitle:    i18n.String{"en": "sss", "xx": "test ps title"},
				FieldTitle: i18n.String{"en": "nnn", "xx": "test field name"},
				FieldDesc:  i18n.String{"en": "kkk", "xx": "test field desc"},
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := MergeManifestTranslation(tc.Manifest, tc.Translations)
			if tc.Expected == nil {
				assert.Nil(tt, res)
				return
			}
			assert.Equal(tt, tc.Expected.PluginName, res.Plugin.Name())
			assert.Equal(tt, tc.Expected.PluginDesc, res.Plugin.Description())
			assert.Equal(tt, tc.Expected.ExtName, res.Plugin.Extension(id.PluginExtensionID("test_ext")).Name())
			assert.Equal(tt, tc.Expected.PsTitle, res.ExtensionSchema[0].Group("test_ps").Title())
			assert.Equal(tt, tc.Expected.FieldTitle, res.ExtensionSchema[0].Group("test_ps").Field("test_field").Title())
			assert.Equal(tt, tc.Expected.FieldDesc, res.ExtensionSchema[0].Group("test_ps").Field("test_field").Description())
		})
	}
}

func sr(s string) *string {
	return &s
}
