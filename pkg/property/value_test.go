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

func TestLatLng_Clone(t *testing.T) {
	testCases := []struct {
		Name         string
		LL, Expected *LatLng
	}{
		{
			Name: "nil latlng",
		},
		{
			Name: "cloned",
			LL: &LatLng{
				Lat: 10,
				Lng: 11,
			},
			Expected: &LatLng{
				Lat: 10,
				Lng: 11,
			},
		},
	}
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.LL.Clone()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestLatLngHeight_Clone(t *testing.T) {
	testCases := []struct {
		Name         string
		LL, Expected *LatLngHeight
	}{
		{
			Name: "nil LatLngHeight",
		},
		{
			Name: "cloned",
			LL: &LatLngHeight{
				Lat:    10,
				Lng:    11,
				Height: 12,
			},
			Expected: &LatLngHeight{
				Lat:    10,
				Lng:    11,
				Height: 12,
			},
		},
	}
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.LL.Clone()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestCamera_Clone(t *testing.T) {
	testCases := []struct {
		Name             string
		Camera, Expected *Camera
	}{
		{
			Name: "nil Camera",
		},
		{
			Name: "cloned",
			Camera: &Camera{
				Lat:      1,
				Lng:      1,
				Altitude: 2,
				Heading:  4,
				Pitch:    5,
				Roll:     6,
				FOV:      7,
			},
			Expected: &Camera{
				Lat:      1,
				Lng:      1,
				Altitude: 2,
				Heading:  4,
				Pitch:    5,
				Roll:     6,
				FOV:      7,
			},
		},
	}
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Camera.Clone()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestTypography_Clone(t *testing.T) {

	i := 10

	testCases := []struct {
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
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Typography.Clone()
			assert.Equal(tt, tc.Expected, res)
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

func TestValue(t *testing.T) {
	ll := LatLng{
		Lat: 1,
		Lng: 2,
	}
	assert.True(t, ValueTypeLatLng.ValidateValue(ll.Value()))

	llh := LatLngHeight{
		Lat:    1,
		Lng:    2,
		Height: 3,
	}
	assert.True(t, ValueTypeLatLngHeight.ValidateValue(llh.Value()))

	ca := Camera{
		Lat:      1,
		Lng:      2,
		Altitude: 3,
		Heading:  4,
		Pitch:    5,
		Roll:     6,
		FOV:      7,
	}
	assert.True(t, ValueTypeCamera.ValidateValue(ca.Value()))

	ty := Typography{
		FontFamily: getStrRef("x"),
		FontWeight: getStrRef("b"),
		FontSize:   nil,
		Color:      getStrRef("red"),
		TextAlign:  TextAlignFromRef(getStrRef(TextAlignCenter.String())),
		Bold:       getBoolRef(true),
		Italic:     getBoolRef(false),
		Underline:  getBoolRef(true),
	}
	assert.True(t, ValueTypeTypography.ValidateValue(ty.Value()))

	co := Coordinates{
		llh,
	}
	assert.True(t, ValueTypeCoordinates.ValidateValue(co.Value()))

	po := Polygon{
		co,
	}
	assert.True(t, ValueTypePolygon.ValidateValue(po.Value()))

	rc := Rect{
		West:  10,
		South: 3,
		East:  5,
		North: 2,
	}
	assert.True(t, ValueTypeRect.ValidateValue(rc.Value()))
}
