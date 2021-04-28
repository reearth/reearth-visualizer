package property

import (
	"encoding/json"
	"net/url"
	"strconv"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestValueTypeFrom(t *testing.T) {
	testCases := []struct {
		Name, Input string
		Expected    struct {
			V ValueType
			B bool
		}
	}{
		{
			Name:  "bool",
			Input: "bool",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeBool,
				B: true,
			},
		},
		{
			Name:  "number",
			Input: "number",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeNumber,
				B: true,
			},
		},
		{
			Name:  "ref",
			Input: "ref",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeRef,
				B: true,
			},
		},
		{
			Name:  "url",
			Input: "url",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeURL,
				B: true,
			},
		},
		{
			Name:  "string",
			Input: "string",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeString,
				B: true,
			},
		}, {
			Name:  "camera",
			Input: "camera",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeCamera,
				B: true,
			},
		},
		{
			Name:  "bool",
			Input: "bool",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeBool,
				B: true,
			},
		},
		{
			Name:  "LatLngHeight",
			Input: "latlngheight",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeLatLngHeight,
				B: true,
			},
		},
		{
			Name:  "latlng",
			Input: "latlng",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeLatLng,
				B: true,
			},
		},
		{
			Name:  "polygon",
			Input: "polygon",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypePolygon,
				B: true,
			},
		},
		{
			Name:  "rect",
			Input: "rect",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeRect,
				B: true,
			},
		},
		{
			Name:  "coordinates",
			Input: "coordinates",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeCoordinates,
				B: true,
			},
		},
		{
			Name:  "typography",
			Input: "typography",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueTypeTypography,
				B: true,
			},
		},
		{
			Name:  "unknown",
			Input: "",
			Expected: struct {
				V ValueType
				B bool
			}{
				V: ValueType(""),
				B: false,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, b := ValueTypeFrom(tc.Input)
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.B, b)

			v2, b2 := v.Validate()
			assert.Equal(tt, tc.Expected.V, v2)
			assert.Equal(tt, tc.Expected.B, b2)
		})
	}
}

func TestValue_IsEmpty(t *testing.T) {
	var v *Value
	assert.True(t, v.IsEmpty())
}

func TestValue_Clone(t *testing.T) {
	var v *Value
	assert.Nil(t, v.Clone())
	v, _ = ValueTypeBool.ValueFrom(true)
	assert.Equal(t, v, v.Clone())
}

func TestValue_Value(t *testing.T) {
	var v *Value
	assert.Nil(t, v.Value())
	v, _ = ValueTypeBool.ValueFrom(true)
	assert.Equal(t, true, v.Value())
}

func TestValue_Type(t *testing.T) {
	var v *Value
	assert.Equal(t, ValueType(""), v.Type())
	v, _ = ValueTypeBool.ValueFrom(true)
	assert.Equal(t, ValueTypeBool, v.Type())
}

func TestValue_ValueBool(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V, Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V:    ValueTypeBool.ValueFromUnsafe(true),
			Expected: struct {
				V, Ok bool
			}{
				V:  true,
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueBool()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueString(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  string
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V:    ValueTypeString.ValueFromUnsafe("xxx"),
			Expected: struct {
				V  string
				Ok bool
			}{V: "xxx", Ok: true},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueString()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueNumber(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  float64
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V:    ValueTypeNumber.ValueFromUnsafe(5.5),
			Expected: struct {
				V  float64
				Ok bool
			}{V: 5.5, Ok: true},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueNumber()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueLatLng(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  LatLng
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V: ValueTypeLatLng.ValueFromUnsafe(map[string]interface{}{
				"Lat": 1,
				"Lng": 2,
			}),
			Expected: struct {
				V  LatLng
				Ok bool
			}{
				V: LatLng{
					Lat: 1,
					Lng: 2,
				},
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueLatLng()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueLatLngHeight(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  LatLngHeight
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V: ValueTypeLatLngHeight.ValueFromUnsafe(map[string]interface{}{
				"Lat":    1,
				"Lng":    2,
				"Height": 22,
			}),
			Expected: struct {
				V  LatLngHeight
				Ok bool
			}{
				V: LatLngHeight{
					Lat:    1,
					Lng:    2,
					Height: 22,
				},
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueLatLngHeight()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueCamera(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  Camera
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V: ValueTypeCamera.ValueFromUnsafe(
				map[string]interface{}{
					"Lat":      1,
					"Lng":      2,
					"Altitude": 3,
					"Heading":  4,
					"Pitch":    5,
					"Roll":     6,
					"FOV":      7,
				}),
			Expected: struct {
				V  Camera
				Ok bool
			}{
				V: Camera{
					Lat:      1,
					Lng:      2,
					Altitude: 3,
					Heading:  4,
					Pitch:    5,
					Roll:     6,
					FOV:      7,
				},
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueCamera()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueCoordinates(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  Coordinates
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V: ValueTypeCoordinates.ValueFromUnsafe(
				[]map[string]interface{}{
					{
						"lat":    1,
						"lng":    2,
						"height": 3,
					},
				}),
			Expected: struct {
				V  Coordinates
				Ok bool
			}{
				V: Coordinates{
					LatLngHeight{
						Lat:    1,
						Lng:    2,
						Height: 3,
					},
				},
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueCoordinates()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValuePolygon(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  Polygon
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V: ValueTypePolygon.ValueFromUnsafe(
				[][]map[string]interface{}{
					{
						{
							"lat":    1,
							"lng":    2,
							"height": 3,
						},
					},
				}),
			Expected: struct {
				V  Polygon
				Ok bool
			}{
				V: []Coordinates{
					[]LatLngHeight{
						{
							Lat:    1,
							Lng:    2,
							Height: 3,
						},
					},
				},
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValuePolygon()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueRect(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  Rect
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V: ValueTypeRect.ValueFromUnsafe(
				map[string]interface{}{
					"West":  2,
					"South": 3,
					"East":  4,
					"North": 5,
				}),
			Expected: struct {
				V  Rect
				Ok bool
			}{
				V: Rect{
					West:  2,
					South: 3,
					East:  4,
					North: 5,
				},
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueRect()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueRef(t *testing.T) {
	uid := id.New()
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  id.ID
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V:    ValueTypeRef.ValueFromUnsafe(uid),
			Expected: struct {
				V  id.ID
				Ok bool
			}{V: uid, Ok: true},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueRef()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueURL(t *testing.T) {
	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  *url.URL
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V: ValueTypeURL.ValueFromUnsafe(map[string]interface{}{
				"Scheme":     "xx",
				"Opaque":     "aa.hh",
				"Path":       "zz/vv.bb",
				"ForceQuery": false,
			}),
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueURL()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_ValueTypography(t *testing.T) {
	ff, fs, ts := "Times New Roman", 10, TextAlignLeft
	var c, fw *string
	var b, i, u *bool

	testCases := []struct {
		Name     string
		V        *Value
		Expected struct {
			V  Typography
			Ok bool
		}
	}{
		{
			Name: "nil value",
		},
		{
			Name: "success",
			V: ValueTypeTypography.ValueFromUnsafe(map[string]interface{}{
				"fontFamily": &ff,
				"fontSize":   &fs,
				"textAlign":  &ts,
				"color":      c,
				"fontWeight": fw,
				"bold":       b,
				"italic":     i,
				"underline":  u,
			}),
			Expected: struct {
				V  Typography
				Ok bool
			}{
				V: Typography{
					FontFamily: &ff,
					FontWeight: fw,
					FontSize:   &fs,
					Color:      c,
					TextAlign:  &ts,
					Bold:       b,
					Italic:     i,
					Underline:  u,
				},
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.V.ValueTypography()
			assert.Equal(tt, tc.Expected.V, v)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValueType_ValueFrom(t *testing.T) {
	var llh *LatLngHeight
	var ll *LatLng
	var ca *Camera
	var rc *Rect
	var cords *Coordinates
	var p *Polygon
	var ty *Typography
	iid := id.New()
	testCases := []struct {
		Name     string
		Input    interface{}
		VT       ValueType
		Expected struct {
			V  interface{}
			Ok bool
		}
	}{
		{
			Name: "valueType is nil",
			VT:   "",
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  nil,
				Ok: false,
			},
		},
		{
			Name: "input is nil",
			VT:   ValueTypeBool,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  nil,
				Ok: true,
			},
		},
		{
			Name:  "bool",
			Input: true,
			VT:    ValueTypeBool,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  true,
				Ok: true,
			},
		},
		{
			Name:  "string",
			Input: "xxx",
			VT:    ValueTypeString,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  "xxx",
				Ok: true,
			},
		},
		{
			Name:  "number: json number",
			Input: json.Number(strconv.FormatFloat(10, 'e', 0, 64)),
			VT:    ValueTypeNumber,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  float64(10),
				Ok: true,
			},
		},
		{
			Name:  "number: float64",
			Input: float64(11),
			VT:    ValueTypeNumber,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  float64(11),
				Ok: true,
			},
		},
		{
			Name:  "number: int64",
			Input: 12,
			VT:    ValueTypeNumber,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  float64(12),
				Ok: true,
			},
		},
		{
			Name:  "ref: string",
			Input: iid.String(),
			VT:    ValueTypeRef,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  iid,
				Ok: true,
			},
		},
		{
			Name:  "ref: id",
			Input: iid,
			VT:    ValueTypeRef,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V:  iid,
				Ok: true,
			},
		},
		{
			Name: "latlng",
			Input: LatLng{
				Lat: 10,
				Lng: 11,
			},
			VT: ValueTypeLatLng,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: LatLng{
					Lat: 10,
					Lng: 11,
				},
				Ok: true,
			},
		},
		{
			Name:  "latlng: nil",
			Input: ll,
			VT:    ValueTypeLatLng,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				Ok: false,
			},
		},
		{
			Name: "latlng: ref",
			Input: &LatLng{
				Lat: 10,
				Lng: 11,
			},
			VT: ValueTypeLatLng,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: LatLng{
					Lat: 10,
					Lng: 11,
				},
				Ok: true,
			},
		},
		{
			Name: "latlng: map",
			Input: map[string]interface{}{
				"lat": 10,
				"lng": 11,
			},
			VT: ValueTypeLatLng,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: LatLng{
					Lat: 10,
					Lng: 11,
				},
				Ok: true,
			},
		},
		{
			Name: "latlngheight: map",
			Input: map[string]interface{}{
				"lng":    11,
				"lat":    12,
				"height": 13,
			},
			VT: ValueTypeLatLngHeight,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: LatLngHeight{
					Lat:    12,
					Lng:    11,
					Height: 13,
				},
				Ok: true,
			},
		},
		{
			Name:  "latlngheight: nil",
			Input: llh,
			VT:    ValueTypeLatLngHeight,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				Ok: false,
			},
		},
		{
			Name: "latlngheight",
			Input: LatLngHeight{
				Lat:    12,
				Lng:    11,
				Height: 13,
			},
			VT: ValueTypeLatLngHeight,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: LatLngHeight{
					Lat:    12,
					Lng:    11,
					Height: 13,
				},
				Ok: true,
			},
		},
		{
			Name: "latlngheight: ref",
			Input: &LatLngHeight{
				Lat:    12,
				Lng:    11,
				Height: 13,
			},
			VT: ValueTypeLatLngHeight,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: LatLngHeight{
					Lat:    12,
					Lng:    11,
					Height: 13,
				},
				Ok: true,
			},
		},
		{
			Name: "camera: map",
			Input: map[string]interface{}{
				"Lat":      1,
				"Lng":      2,
				"Altitude": 3,
				"Heading":  4,
				"Pitch":    5,
				"Roll":     6,
				"FOV":      7,
			},
			VT: ValueTypeCamera,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Camera{
					Lat:      1,
					Lng:      2,
					Altitude: 3,
					Heading:  4,
					Pitch:    5,
					Roll:     6,
					FOV:      7,
				},
				Ok: true,
			},
		},
		{
			Name: "camera",
			Input: Camera{
				Lat:      1,
				Lng:      2,
				Altitude: 3,
				Heading:  4,
				Pitch:    5,
				Roll:     6,
				FOV:      7,
			},
			VT: ValueTypeCamera,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Camera{
					Lat:      1,
					Lng:      2,
					Altitude: 3,
					Heading:  4,
					Pitch:    5,
					Roll:     6,
					FOV:      7,
				},
				Ok: true,
			},
		},
		{
			Name: "camera: ref",
			Input: &Camera{
				Lat:      1,
				Lng:      2,
				Altitude: 3,
				Heading:  4,
				Pitch:    5,
				Roll:     6,
				FOV:      7,
			},
			VT: ValueTypeCamera,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Camera{
					Lat:      1,
					Lng:      2,
					Altitude: 3,
					Heading:  4,
					Pitch:    5,
					Roll:     6,
					FOV:      7,
				},
				Ok: true,
			},
		},
		{
			Name:  "camera: nil",
			Input: ca,
			VT:    ValueTypeCamera,
			Expected: struct {
				V  interface{}
				Ok bool
			}{},
		},
		{
			Name:  "rect: nil",
			Input: rc,
			VT:    ValueTypeRect,
			Expected: struct {
				V  interface{}
				Ok bool
			}{},
		},
		{
			Name: "rect: map",
			Input: map[string]interface{}{
				"West":  2,
				"South": 3,
				"East":  4,
				"North": 5,
			},
			VT: ValueTypeRect,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Rect{
					West:  2,
					South: 3,
					East:  4,
					North: 5,
				},
				Ok: true,
			},
		},
		{
			Name: "rect",
			Input: Rect{
				West:  2,
				South: 3,
				East:  4,
				North: 5,
			},
			VT: ValueTypeRect,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Rect{
					West:  2,
					South: 3,
					East:  4,
					North: 5,
				},
				Ok: true,
			},
		},
		{
			Name: "rect: ref",
			Input: &Rect{
				West:  2,
				South: 3,
				East:  4,
				North: 5,
			},
			VT: ValueTypeRect,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Rect{
					West:  2,
					South: 3,
					East:  4,
					North: 5,
				},
				Ok: true,
			},
		},
		{
			Name: "cods: map",
			Input: []map[string]interface{}{
				{
					"lat":    1,
					"lng":    2,
					"height": 3,
				},
			},
			VT: ValueTypeCoordinates,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Coordinates{
					{
						Lat:    1,
						Lng:    2,
						Height: 3,
					},
				},
				Ok: true,
			},
		},
		{
			Name: "cods: ref",
			Input: &Coordinates{
				{
					Lat:    1,
					Lng:    2,
					Height: 3,
				},
			},
			VT: ValueTypeCoordinates,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Coordinates{
					{
						Lat:    1,
						Lng:    2,
						Height: 3,
					},
				},
				Ok: true,
			},
		},
		{
			Name:  "cods: nil",
			Input: cords,
			VT:    ValueTypeCoordinates,
		},
		{
			Name:  "polygon: nil",
			Input: p,
			VT:    ValueTypePolygon,
		},
		{
			Name: "polygon: nil",
			Input: &Polygon{
				Coordinates{
					{
						Lat:    1,
						Lng:    2,
						Height: 3,
					},
				},
			},
			VT: ValueTypePolygon,
			Expected: struct {
				V  interface{}
				Ok bool
			}{
				V: Polygon{
					Coordinates{
						{
							Lat:    1,
							Lng:    2,
							Height: 3,
						},
					},
				},
				Ok: true,
			},
		},
		{
			Name:  "typography: nil",
			Input: ty,
			VT:    ValueTypeTypography,
		},
		{
			Name:  "undefined",
			Input: "ttt",
			VT:    "xxx",
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			v, ok := tc.VT.ValueFrom(tc.Input)
			assert.Equal(tt, tc.Expected.V, v.Value())
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValue_Interface(t *testing.T) {
	ff, fs, ts := "Times New Roman", 10, TextAlignLeft
	var c, fw *string
	var b, i, u *bool
	testCases := []struct {
		Name     string
		V        *Value
		Expected interface{}
	}{
		{
			Name: "nil",
		},
		{
			Name:     "undefined",
			V:        ValueType("uu").ValueFromUnsafe("xx"),
			Expected: nil,
		},
		{
			Name:     "bool",
			V:        ValueTypeBool.ValueFromUnsafe(true),
			Expected: true,
		},
		{
			Name: "latlng",
			V: ValueTypeLatLng.ValueFromUnsafe(
				LatLng{
					Lat: 1,
					Lng: 2,
				}),
			Expected: map[string]interface{}{
				"lat": 1.0,
				"lng": 2.0,
			},
		},
		{
			Name: "Typography",
			V: ValueTypeTypography.ValueFromUnsafe(
				Typography{
					FontFamily: &ff,
					FontWeight: fw,
					FontSize:   &fs,
					Color:      c,
					TextAlign:  &ts,
					Bold:       b,
					Italic:     i,
					Underline:  u,
				}),
			Expected: map[string]interface{}{
				"fontFamily": &ff,
				"fontSize":   &fs,
				"textAlign":  &ts,
				"color":      c,
				"fontWeight": fw,
				"bold":       b,
				"italic":     i,
				"underline":  u,
			},
		},
		{
			Name: "camera",
			V: ValueTypeCamera.ValueFromUnsafe(
				Camera{
					Lat:      1,
					Lng:      2,
					Altitude: 3,
					Heading:  4,
					Pitch:    5,
					Roll:     6,
					FOV:      7,
				}),
			Expected: map[string]interface{}{
				"lat":      1.0,
				"lng":      2.0,
				"altitude": 3.0,
				"heading":  4.0,
				"pitch":    5.0,
				"roll":     6.0,
				"fov":      7.0,
			},
		},
		{
			Name: "rect",
			V: ValueTypeRect.ValueFromUnsafe(
				Rect{
					West:  2,
					South: 3,
					East:  4,
					North: 5,
				}),
			Expected: map[string]interface{}{
				"west":  2.0,
				"south": 3.0,
				"east":  4.0,
				"north": 5.0,
			},
		},
		{
			Name: "latlngheight",
			V: ValueTypeLatLngHeight.ValueFromUnsafe(
				LatLngHeight{
					Lat:    1,
					Lng:    2,
					Height: 3,
				}),
			Expected: map[string]interface{}{
				"lat":    1.0,
				"lng":    2.0,
				"height": 3.0,
			},
		},
		{
			Name: "coordinates",
			V: ValueTypeCoordinates.ValueFromUnsafe(
				Coordinates{
					LatLngHeight{
						Lat:    1,
						Lng:    2,
						Height: 3,
					},
				}),
			Expected: []map[string]interface{}{
				{
					"lat":    1.0,
					"lng":    2.0,
					"height": 3.0,
				},
			},
		},
		{
			Name: "polygon",
			V: ValueTypePolygon.ValueFromUnsafe(
				Polygon{
					Coordinates{
						LatLngHeight{
							Lat:    1,
							Lng:    2,
							Height: 3,
						},
					},
				}),
			Expected: [][]map[string]interface{}{
				{{
					"lat":    1.0,
					"lng":    2.0,
					"height": 3.0,
				}},
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			i := tc.V.Interface()
			assert.Equal(tt, tc.Expected, i)
		})
	}
}
