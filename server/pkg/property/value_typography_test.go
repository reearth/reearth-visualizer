package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func getStrRef(i string) *string {
	return &i
}

func getBoolRef(i bool) *bool {
	return &i
}

func TestTypography_Clone(t *testing.T) {
	i := 10

	testes := []struct {
		Name                 string
		Typography, Expected *Typography
	}{
		{
			Name: "nil typography",
		},
		{
			Name: "cloned",
			Typography: &Typography{
				FontFamily: getStrRef("x"),
				FontWeight: getStrRef("b"),
				FontSize:   &i,
				Color:      getStrRef("red"),
				TextAlign:  TextAlignFromRef(getStrRef(TextAlignCenter.String())),
				Bold:       getBoolRef(true),
				Italic:     getBoolRef(false),
				Underline:  getBoolRef(true),
			},
			Expected: &Typography{
				FontFamily: getStrRef("x"),
				FontWeight: getStrRef("b"),
				FontSize:   &i,
				Color:      getStrRef("red"),
				TextAlign:  TextAlignFromRef(getStrRef("center")),
				Bold:       getBoolRef(true),
				Italic:     getBoolRef(false),
				Underline:  getBoolRef(true),
			},
		},
	}

	for _, tc := range testes {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Typography.Clone()
			assert.Equal(t, tc.Expected, res)
			if tc.Expected != nil {
				assert.NotSame(t, tc.Expected, res)
			}
		})
	}
}

func TestTextAlignFrom(t *testing.T) {
	tests := []struct {
		Name     string
		Expected struct {
			TA   TextAlign
			Bool bool
		}
	}{
		{
			Name: "left",
			Expected: struct {
				TA   TextAlign
				Bool bool
			}{
				TA:   TextAlignLeft,
				Bool: true,
			},
		},
		{
			Name: "right",
			Expected: struct {
				TA   TextAlign
				Bool bool
			}{
				TA:   TextAlignRight,
				Bool: true,
			},
		},
		{
			Name: "center",
			Expected: struct {
				TA   TextAlign
				Bool bool
			}{
				TA:   TextAlignCenter,
				Bool: true,
			},
		},
		{
			Name: "justify",
			Expected: struct {
				TA   TextAlign
				Bool bool
			}{
				TA:   TextAlignJustify,
				Bool: true,
			},
		},
		{
			Name: "justify_all",
			Expected: struct {
				TA   TextAlign
				Bool bool
			}{
				TA:   TextAlignJustifyAll,
				Bool: true,
			},
		},
		{
			Name: "undefined",
			Expected: struct {
				TA   TextAlign
				Bool bool
			}{
				TA:   TextAlign(""),
				Bool: false,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, ok := TextAlignFrom(tc.Name)
			assert.Equal(t, tc.Expected.TA, res)
			assert.Equal(t, tc.Expected.Bool, ok)
		})
	}
}

func TestTextAlignFromRef(t *testing.T) {
	ja := TextAlignJustifyAll
	j := TextAlignJustify
	c := TextAlignCenter
	l := TextAlignLeft
	r := TextAlignRight

	tests := []struct {
		Name     string
		Input    *string
		Expected *TextAlign
	}{
		{
			Name:     "left",
			Input:    getStrRef("left"),
			Expected: &l,
		},
		{
			Name:     "right",
			Input:    getStrRef("right"),
			Expected: &r,
		},
		{
			Name:     "center",
			Input:    getStrRef("center"),
			Expected: &c,
		},
		{
			Name:     "justify",
			Input:    getStrRef("justify"),
			Expected: &j,
		},
		{
			Name:     "justify_all",
			Input:    getStrRef("justify_all"),
			Expected: &ja,
		},
		{
			Name:  "undefined",
			Input: getStrRef("undefined"),
		},
		{
			Name: "nil input",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := TextAlignFromRef(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestTextAlign_StringRef(t *testing.T) {
	var ta *TextAlign
	assert.Nil(t, ta.StringRef())
}
