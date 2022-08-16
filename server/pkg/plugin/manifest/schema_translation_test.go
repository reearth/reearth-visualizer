package manifest

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestTranslationMap_Translated(t *testing.T) {
	m := TranslationMap{
		"en": TranslationRoot{
			Name:        lo.ToPtr("Name"),
			Description: lo.ToPtr("desc"),
			Extensions: map[string]TranslationExtension{
				"a": {
					Name: lo.ToPtr("ext"),
					PropertySchema: TranslationPropertySchema{
						"default": {
							Fields: map[string]TranslationPropertySchemaField{
								"foo": {
									Title:   lo.ToPtr("foo"),
									Choices: map[string]string{"A": "AAA", "B": "BBB"},
									Prefix:  lo.ToPtr("P"),
									Suffix:  lo.ToPtr("S"),
								},
								"hoge": {Title: lo.ToPtr("hoge")},
							},
						},
					},
				},
			},
			Schema: TranslationPropertySchema{
				"another": {
					Fields: map[string]TranslationPropertySchemaField{
						"foo": {Choices: map[string]string{"A": "AAA"}},
					},
				},
			},
		},
		"ja": TranslationRoot{
			Name: lo.ToPtr("名前"),
			Extensions: map[string]TranslationExtension{
				"a": {
					Name:        lo.ToPtr("extJA"),
					Description: lo.ToPtr("DESC!"),
					PropertySchema: TranslationPropertySchema{
						"default": {
							Fields: map[string]TranslationPropertySchemaField{
								"foo": {
									Title:       lo.ToPtr("foo!"),
									Description: lo.ToPtr("DESC"),
									Choices:     map[string]string{"B": "BBB!", "C": "CCC!"},
									Prefix:      lo.ToPtr("p"),
								},
								"bar": {Title: lo.ToPtr("bar!")},
							},
						},
					},
				},
				"b": {
					Name:           lo.ToPtr("ext2"),
					PropertySchema: TranslationPropertySchema{},
				},
			},
			Schema: TranslationPropertySchema{
				"default": {
					Fields: map[string]TranslationPropertySchemaField{
						"a": {Title: lo.ToPtr("あ")},
					},
				},
			},
		},
		"zh-CN": TranslationRoot{
			Name: lo.ToPtr("命名"),
			Schema: TranslationPropertySchema{
				"another": {
					Description: lo.ToPtr("描述"),
				},
			},
		},
	}

	expected := TranslatedRoot{
		Name:        i18n.String{"en": "Name", "ja": "名前", "zh-CN": "命名"},
		Description: i18n.String{"en": "desc"},
		Extensions: map[string]*TranslatedExtension{
			"a": {
				Name:        i18n.String{"en": "ext", "ja": "extJA"},
				Description: i18n.String{"ja": "DESC!"},
				PropertySchema: TranslatedPropertySchema{
					"default": &TranslatedPropertySchemaGroup{
						Fields: map[string]*TranslatedPropertySchemaField{
							"foo": {
								Title:       i18n.String{"en": "foo", "ja": "foo!"},
								Description: i18n.String{"ja": "DESC"},
								Choices: map[string]i18n.String{
									"A": {"en": "AAA"},
									"B": {"en": "BBB", "ja": "BBB!"},
									"C": {"ja": "CCC!"},
								},
								Prefix: i18n.String{"en": "P", "ja": "p"},
								Suffix: i18n.String{"en": "S"},
							},
							"hoge": {
								Title: i18n.String{"en": "hoge"},
							},
							"bar": {
								Title: i18n.String{"ja": "bar!"},
							},
						},
					},
				},
			},
			"b": {
				Name: i18n.String{"ja": "ext2"},
			},
		},
		Schema: TranslatedPropertySchema{
			"default": {
				Title:       nil,
				Description: nil,
				Fields: map[string]*TranslatedPropertySchemaField{
					"a": {Title: i18n.String{"ja": "あ"}},
				},
			},
			"another": {
				Title:       nil,
				Description: i18n.String{"zh-CN": "描述"},
				Fields: map[string]*TranslatedPropertySchemaField{
					"foo": {Choices: map[string]i18n.String{"A": {"en": "AAA"}}},
				},
			},
		},
	}

	assert.Equal(t, expected, m.Translated())
	assert.Equal(t, TranslatedRoot{}, TranslationMap{}.Translated())
	assert.Equal(t, TranslatedRoot{}, TranslationMap(nil).Translated())
}

func TestTranslatedPropertySchema_getOrCreateGroup(t *testing.T) {
	target := TranslatedPropertySchema{}
	expected := TranslatedPropertySchema{
		"a": {Title: i18n.String{"ja": "A"}},
	}

	group := target.getOrCreateGroup("a")
	assert.Equal(t, &TranslatedPropertySchemaGroup{}, group)

	group.Title = i18n.String{"ja": "A"}
	assert.Equal(t, expected, target)
}

func TestTranslatedPropertySchema_getOrCreateField(t *testing.T) {
	target := TranslatedPropertySchemaGroup{}
	expected := TranslatedPropertySchemaGroup{
		Fields: map[string]*TranslatedPropertySchemaField{
			"a": {Title: i18n.String{"ja": "A"}},
		},
	}

	field := target.getOrCreateField("a")
	assert.Equal(t, &TranslatedPropertySchemaField{}, field)

	field.Title = i18n.String{"ja": "A"}
	assert.Equal(t, expected, target)
}

func TestTranslatedPropertySchema_setPropertySchema(t *testing.T) {
	target := TranslatedPropertySchema{
		"a": nil,
		"b": {},
	}
	expected := TranslatedPropertySchema{
		"a": {
			Title: i18n.String{"ja": "A"},
			Fields: map[string]*TranslatedPropertySchemaField{
				"f": {Title: i18n.String{"en": "F"}},
			}},
		"b": {Title: i18n.String{"en": "B"}},
	}

	target.setPropertySchema(map[string]TranslationPropertySchema{
		"en": {
			"a": {
				Fields: map[string]TranslationPropertySchemaField{
					"f": {Title: lo.ToPtr("F")},
				},
			},
			"b": {Title: lo.ToPtr("B")},
		},
		"ja": {"a": {Title: lo.ToPtr("A")}},
	})
	assert.Equal(t, expected, target)
}
