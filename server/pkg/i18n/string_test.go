package i18n

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestString_String(t *testing.T) {
	tests := []struct {
		Name, Expected string
		Target         String
	}{
		{
			Name:     "en string",
			Expected: "foo",
			Target:   String{"en": "foo"},
		},
		{
			Name:     "nil string",
			Expected: "",
			Target:   nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.Target.String())
		})
	}
}

func TestString_WithDefault(t *testing.T) {
	tests := []struct {
		Name     string
		Target   String
		Input    string
		Expected String
	}{
		{
			Name:     "ok",
			Target:   String{"en": "foo", "ja": "bar"},
			Input:    "x",
			Expected: String{"en": "x", "ja": "bar"},
		},
		{
			Name:     "empty default",
			Target:   String{"en": "foo"},
			Input:    "",
			Expected: String{"en": "foo"},
		},
		{
			Name:     "empty",
			Target:   String{},
			Input:    "x",
			Expected: String{"en": "x"},
		},
		{
			Name:     "empty string and empty default",
			Target:   String{},
			Input:    "",
			Expected: String{},
		},
		{
			Name:     "nil string",
			Target:   nil,
			Input:    "x",
			Expected: String{"en": "x"},
		},
		{
			Name:     "nil string and empty default",
			Target:   nil,
			Input:    "",
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.Target.WithDefault(tc.Input))
		})
	}
}

func TestString_WithDefaultRef(t *testing.T) {
	tests := []struct {
		Name     string
		Target   String
		Input    *string
		Expected String
	}{
		{
			Name:     "ok",
			Target:   String{"en": "foo", "ja": "bar"},
			Input:    sr("x"),
			Expected: String{"en": "x", "ja": "bar"},
		},
		{
			Name:     "nil default",
			Target:   String{"en": "foo", "ja": "bar"},
			Input:    nil,
			Expected: String{"en": "foo", "ja": "bar"},
		},
		{
			Name:     "empty default",
			Target:   String{"en": "foo"},
			Input:    sr(""),
			Expected: String{"en": "foo"},
		},
		{
			Name:     "empty",
			Target:   String{},
			Input:    sr("x"),
			Expected: String{"en": "x"},
		},
		{
			Name:     "empty string and empty default",
			Target:   String{},
			Input:    sr(""),
			Expected: String{},
		},
		{
			Name:     "nil string",
			Target:   nil,
			Input:    sr("x"),
			Expected: String{"en": "x"},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.Target.WithDefaultRef(tc.Input))
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
	assert.Equal(t, String{}, StringFrom(""))
}

func TestString_Clone(t *testing.T) {
	tests := []struct {
		Name             string
		Target, Expected String
	}{
		{
			Name:     "String with content",
			Target:   String{"ja": "foo"},
			Expected: String{"ja": "foo"},
		},
		{
			Name:     "empty String",
			Target:   String{},
			Expected: nil,
		},
		{
			Name:     "nil",
			Target:   nil,
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Target.Clone()
			assert.Equal(t, tc.Expected, res)
			assert.NotSame(t, tc.Target, res)
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

func sr(s string) *string {
	return &s
}
