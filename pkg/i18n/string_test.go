package i18n

import (
	"reflect"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestString_String(t *testing.T) {
	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.ExpectedStr, tc.I18nString.String())
		})
	}
}

func TestStringTranslated(t *testing.T) {
	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.ExpectedStr, tc.I18nString.Translated(tc.Lang))
		})
	}
}

func TestStringFrom(t *testing.T) {
	assert.Equal(t, String{"en": "foo"}, StringFrom("foo"))
}

func TestStringCopy(t *testing.T) {
	testCases := []struct {
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
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.True(tt, reflect.DeepEqual(tc.SourceString, tc.SourceString.Copy()))
		})
	}
}

func TestString_StringRef(t *testing.T) {
	stringRef := func(s string) *string {
		return &s
	}

	testCases := []struct {
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected, tc.I18nString.StringRef())
		})
	}
}
