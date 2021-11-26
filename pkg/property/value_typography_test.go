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
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Typography.Clone()
			assert.Equal(tt, tc.Expected, res)
			if tc.Expected != nil {
				assert.NotSame(tt, tc.Expected, res)
			}
		})
	}
}

func TestTextAlignFrom(t *testing.T) {
	testCases := []struct {
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

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, ok := TextAlignFrom(tc.Name)
			assert.Equal(tt, tc.Expected.TA, res)
			assert.Equal(tt, tc.Expected.Bool, ok)
		})
	}
}

func TestTextAlignFromRef(t *testing.T) {
	ja := TextAlignJustifyAll
	j := TextAlignJustify
	c := TextAlignCenter
	l := TextAlignLeft
	r := TextAlignRight
	testCases := []struct {
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

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := TextAlignFromRef(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestTextAlign_StringRef(t *testing.T) {
	var ta *TextAlign
	assert.Nil(t, ta.StringRef())
}
