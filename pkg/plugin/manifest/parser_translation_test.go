package manifest

import (
	"errors"
	"strings"
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/xeipuuv/gojsonschema"

	"github.com/stretchr/testify/assert"
)

const translatedManifest = `{
  "description": "test plugin desc",
  "title": "test plugin name",
  "extensions": {
    "test_ext": {
      "title": "test ext name",
      "propertySchema": {
        "test_ps": {
          "description": "test ps desc",
          "title": "test ps title",
          "fields": {
            "test_field": {
              "title": "test field name",
              "description": "test field desc",
               "choices": {
                "test_key": "test choice value"
              }
            }
          }
        }
      }
    }
  }
}`

func TestParseTranslation(t *testing.T) {
	desc := "test plugin desc"
	name := "test plugin name"
	ext_name := "test ext name"
	ps_title := "test ps title"
	ps_desc := "test ps desc"
	psf_desc := "test field desc"
	psf_name := "test field name"
	testCases := []struct {
		name     string
		input    string
		expected *TranslationRoot
		err      error
	}{
		{
			name:  "success create translation",
			input: translatedManifest,
			expected: &TranslationRoot{
				Description: &desc,
				Extensions: map[string]TranslationExtension{
					"test_ext": {
						Title: &ext_name,
						PropertySchema: TranslationPropertySchema{
							"test_ps": TranslationPropertySchemaGroup{
								Description: &ps_desc,
								Fields: map[string]TranslationPropertySchemaField{
									"test_field": {
										Choices: map[string]string{
											"test_key": "test choice value"},
										Description: &psf_desc,
										Title:       &psf_name,
									},
								},
								Title: &ps_title,
							},
						},
					},
				},
				Title:  &name,
				Schema: nil,
			},
			err: nil,
		},
		{
			name:     "fail not valid JSON",
			input:    "",
			expected: nil,
			err:      ErrFailedToParseManifest,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			r := strings.NewReader(tc.input)
			res, err := ParseTranslation(r)
			if err == nil {
				assert.Equal(tt, *tc.expected.Title, *res.Title)
				assert.Equal(tt, *res.Description, *tc.expected.Description)
				assert.Equal(tt, res.Schema, tc.expected.Schema)
				if len(res.Extensions) > 0 {
					for k, v := range res.Extensions {
						assert.Equal(tt, *v.Title, *tc.expected.Extensions[k].Title)
						if len(v.PropertySchema) > 0 {
							for kk, vv := range v.PropertySchema {
								assert.Equal(tt, *vv.Description, *tc.expected.Extensions[k].PropertySchema[kk].Description)
								assert.Equal(tt, *vv.Title, *tc.expected.Extensions[k].PropertySchema[kk].Title)
								if len(vv.Fields) > 0 {
									for kkk, vvv := range vv.Fields {
										assert.Equal(tt, *vvv.Description, *tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Description)
										assert.Equal(tt, *vvv.Title, *tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Title)
										if len(vvv.Choices) > 0 {
											for kkkk, vvvv := range vvv.Choices {
												assert.Equal(tt, vvvv, tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Choices[kkkk])
											}
										}
									}
								}
							}
						}
					}
				}
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestParseTranslationFromStaticJSON(t *testing.T) {
	desc := "test plugin desc"
	name := "test plugin name"
	ext_name := "test ext name"
	ps_title := "test ps title"
	ps_desc := "test ps desc"
	psf_desc := "test field desc"
	psf_name := "test field name"
	testCases := []struct {
		name     string
		input    string
		expected *TranslationRoot
		err      error
	}{
		{
			name:  "success create translation",
			input: translatedManifest,
			expected: &TranslationRoot{
				Description: &desc,
				Extensions: map[string]TranslationExtension{
					"test_ext": {
						Title: &ext_name,
						PropertySchema: TranslationPropertySchema{
							"test_ps": TranslationPropertySchemaGroup{
								Description: &ps_desc,
								Fields: map[string]TranslationPropertySchemaField{
									"test_field": {
										Choices: map[string]string{
											"test_key": "test choice value"},
										Description: &psf_desc,
										Title:       &psf_name,
									},
								},
								Title: &ps_title,
							},
						},
					},
				},
				Title:  &name,
				Schema: nil,
			},
			err: nil,
		},
		{
			name:     "fail not valid JSON",
			input:    "",
			expected: nil,
			err:      ErrFailedToParseManifest,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res, err := ParseTranslationFromStaticJSON(tc.input)
			if err == nil {
				assert.Equal(tt, *tc.expected.Title, *res.Title)
				assert.Equal(tt, *res.Description, *tc.expected.Description)
				assert.Equal(tt, res.Schema, tc.expected.Schema)
				if len(res.Extensions) > 0 {
					for k, v := range res.Extensions {
						assert.Equal(tt, *v.Title, *tc.expected.Extensions[k].Title)
						if len(v.PropertySchema) > 0 {
							for kk, vv := range v.PropertySchema {
								assert.Equal(tt, *vv.Description, *tc.expected.Extensions[k].PropertySchema[kk].Description)
								assert.Equal(tt, *vv.Title, *tc.expected.Extensions[k].PropertySchema[kk].Title)
								if len(vv.Fields) > 0 {
									for kkk, vvv := range vv.Fields {
										assert.Equal(tt, *vvv.Description, *tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Description)
										assert.Equal(tt, *vvv.Title, *tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Title)
										if len(vvv.Choices) > 0 {
											for kkkk, vvvv := range vvv.Choices {
												assert.Equal(tt, vvvv, tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Choices[kkkk])
											}
										}
									}
								}
							}
						}
					}
				}
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestMustParseTransSystemFromStaticJSON(t *testing.T) {
	desc := "test plugin desc"
	name := "test plugin name"
	ext_name := "test ext name"
	ps_title := "test ps title"
	ps_desc := "test ps desc"
	psf_desc := "test field desc"
	psf_name := "test field name"
	testCases := []struct {
		name     string
		input    string
		expected *TranslationRoot
		err      error
	}{
		{
			name:  "success create translation",
			input: translatedManifest,
			expected: &TranslationRoot{
				Description: &desc,
				Extensions: map[string]TranslationExtension{
					"test_ext": {
						Title: &ext_name,
						PropertySchema: TranslationPropertySchema{
							"test_ps": TranslationPropertySchemaGroup{
								Description: &ps_desc,
								Fields: map[string]TranslationPropertySchemaField{
									"test_field": {
										Choices: map[string]string{
											"test_key": "test choice value"},
										Description: &psf_desc,
										Title:       &psf_name,
									},
								},
								Title: &ps_title,
							},
						},
					},
				},
				Title:  &name,
				Schema: nil,
			},
			err: nil,
		},
		{
			name:     "fail not valid JSON",
			input:    "",
			expected: nil,
			err:      ErrFailedToParseManifest,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc := tc
			var res *TranslationRoot
			defer func() {
				if r := recover(); r == nil {
					assert.Equal(tt, *tc.expected.Title, *res.Title)
					assert.Equal(tt, *res.Description, *tc.expected.Description)
					assert.Equal(tt, res.Schema, tc.expected.Schema)
					if len(res.Extensions) > 0 {
						for k, v := range res.Extensions {
							assert.Equal(tt, *v.Title, *tc.expected.Extensions[k].Title)
							if len(v.PropertySchema) > 0 {
								for kk, vv := range v.PropertySchema {
									assert.Equal(tt, *vv.Description, *tc.expected.Extensions[k].PropertySchema[kk].Description)
									assert.Equal(tt, *vv.Title, *tc.expected.Extensions[k].PropertySchema[kk].Title)
									if len(vv.Fields) > 0 {
										for kkk, vvv := range vv.Fields {
											assert.Equal(tt, *vvv.Description, *tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Description)
											assert.Equal(tt, *vvv.Title, *tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Title)
											if len(vvv.Choices) > 0 {
												for kkkk, vvvv := range vvv.Choices {
													assert.Equal(tt, vvvv, tc.expected.Extensions[k].PropertySchema[kk].Fields[kkk].Choices[kkkk])
												}
											}
										}
									}
								}
							}
						}
					}

				}
			}()
			res = MustParseTransSystemFromStaticJSON(tc.input)
		})
	}
}

func TestMergeManifestTranslation(t *testing.T) {
	const manifest = `{
  "id": "xxx",
  "title": "aaa",
  "version": "1.1.1",
  "description": "ddd",
  "extensions": [
    {
      "id": "test_ext",
      "title": "ttt",
	  "visualizer": "cesium",
      "type": "primitive",
      "schema": {
        "groups": [
          {
            "id": "test_ps",
            "title": "sss",
            "fields": [
              {
                "id": "test_field",
                "title": "nnn",
				"type": "string",
                "description": "kkk"
              }
            ]
          }
        ]
      }
    }
  ]
}`

	testCases := []struct {
		name     string
		tl       map[string]*TranslationRoot
		m        *Manifest
		Expected *struct {
			PluginName, PluginDesc, ExtName, PsTitle, FieldName, FieldDesc i18n.String
		}
	}{
		{
			name:     "nil translition list",
			tl:       nil,
			m:        nil,
			Expected: nil,
		},
		{
			name: "nil translition list",
			tl:   map[string]*TranslationRoot{"xx": MustParseTransSystemFromStaticJSON(translatedManifest)},
			m:    MustParseSystemFromStaticJSON(manifest),
			Expected: &struct{ PluginName, PluginDesc, ExtName, PsTitle, FieldName, FieldDesc i18n.String }{
				PluginName: i18n.String{"en": "aaa", "xx": "test plugin name"},
				PluginDesc: i18n.String{"en": "ddd", "xx": "test plugin desc"},
				ExtName:    i18n.String{"en": "ttt", "xx": "test ext name"},
				PsTitle:    i18n.String{"en": "sss", "xx": "test ps title"},
				FieldName:  i18n.String{"en": "nnn", "xx": "test field name"},
				FieldDesc:  i18n.String{"en": "kkk", "xx": "test field desc"},
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res := MergeManifestTranslation(tc.m, tc.tl)
			if res == nil {
				assert.Nil(tt, tc.Expected)
			} else {
				assert.Equal(tt, tc.Expected.PluginDesc, res.Plugin.Description())
				assert.Equal(tt, tc.Expected.PluginName, res.Plugin.Name())
				//assert.Equal(tt, tc.Expected.PsTitle, res.ExtensionSchema[0].Group("test_ps").Title())
				//assert.Equal(tt, tc.Expected.FieldName, res.ExtensionSchema[0].Group("test_ps").Field("test_field").Name())
				//assert.Equal(tt, tc.Expected.FieldDesc, res.ExtensionSchema[0].Group("test_ps").Field("test_field").Description())
				//assert.Equal(tt, tc.Expected.ExtName, res.ExtensionSchema[0])
			}
		})
	}
}

func TestValidatTranslation(t *testing.T) {
	testCases := []struct {
		name, input string
		err         bool
	}{
		{
			name:  "success create translation",
			input: translatedManifest,

			err: false,
		},
		{
			name:  "fail not valid JSON",
			input: "",
			err:   true,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			err := validateTranslation(gojsonschema.NewBytesLoader([]byte(tc.input)))
			if tc.err {
				assert.Error(tt, err)
			} else {
				assert.NoError(tt, err)
			}
		})
	}

}
