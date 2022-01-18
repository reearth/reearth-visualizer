package i18n

import (
	"reflect"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestString_String(t *testing.T) {
	tests := []struct {
		Name, ExpectedStr string
		I18nString        String
	}{
		{
			Name:        "en string",
			ExpectedStr: "foo",
			I18nString:  String{"en": "foo"},
		},
		{
			Name:        "nil string",
			ExpectedStr: "",
			I18nString:  nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.ExpectedStr, tc.I18nString.String())
		})
	}
}

func TestStringTranslated(t *testing.T) {
	tests := []struct {
		Name, Lang, ExpectedStr string
		I18nString              String
	}{
		{
			Name:        "ja string",
			Lang:        "ja",
			ExpectedStr: "fooJA",
			I18nString:  String{"ja": "fooJA"},
		},
		{
			Name:        "default string",
			ExpectedStr: "foo",
			Lang:        "",
			I18nString:  String{"en": "foo"},
		},
		{
			Name:        "nil string",
			ExpectedStr: "",
			Lang:        "",
			I18nString:  nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.ExpectedStr, tc.I18nString.Translated(tc.Lang))
		})
	}
}

func TestStringFrom(t *testing.T) {
	assert.Equal(t, String{"en": "foo"}, StringFrom("foo"))
	assert.Nil(t, String(nil), StringFrom(""))
}

func TestStringCopy(t *testing.T) {
	tests := []struct {
		Name         string
		SourceString String
	}{
		{
			Name:         "String with content",
			SourceString: String{"ja": "foo"},
		},
		{
			Name:         "empty String",
			SourceString: String{},
		},
		{
			Name:         "nil",
			SourceString: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.True(t, reflect.DeepEqual(tc.SourceString, tc.SourceString.Copy()))
			if tc.SourceString == nil {
				assert.Nil(t, tc.SourceString.Copy())
			}
		})
	}
}

func TestString_StringRef(t *testing.T) {
	stringRef := func(s string) *string {
		return &s
	}

	tests := []struct {
		Name       string
		I18nString String
		Expected   *string
	}{
		{
			Name:       "en string",
			I18nString: String{"en": "foo"},
			Expected:   stringRef("foo"),
		},
		{
			Name:       "nil string",
			I18nString: nil,
			Expected:   nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.I18nString.StringRef())
		})
	}
}
