package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/stretchr/testify/assert"
)

func TestValueFromDataset(t *testing.T) {
	testCases := []struct {
		Name     string
		Input    *dataset.Value
		Expected struct {
			V  *Value
			Ok bool
		}
	}{
		{
			Name: "latlng",
			Input: dataset.ValueFrom(dataset.LatLng{
				Lat: 10,
				Lng: 12,
			}),
			Expected: struct {
				V  *Value
				Ok bool
			}{
				V: ValueTypeLatLng.ValueFromUnsafe(LatLng{
					Lat: 10,
					Lng: 12,
				}),
				Ok: true,
			},
		},
		{
			Name: "LatLngHeight",
			Input: dataset.ValueFrom(dataset.LatLngHeight{
				Lat:    10,
				Lng:    12,
				Height: 14,
			}),
			Expected: struct {
				V  *Value
				Ok bool
			}{
				V: ValueTypeLatLngHeight.ValueFromUnsafe(LatLngHeight{
					Lat:    10,
					Lng:    12,
					Height: 14,
				}),
				Ok: true,
			},
		},
	}
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, ok := valueFromDataset(tc.Input)
			assert.Equal(tt, tc.Expected.V, res)
			assert.Equal(tt, tc.Expected.Ok, ok)
		})
	}
}

func TestValueTypeFromDataset(t *testing.T) {
	testCases := []struct {
		Name     string
		Input    dataset.ValueType
		Expected ValueType
	}{
		{
			Name:     "latlng",
			Input:    dataset.ValueTypeLatLng,
			Expected: ValueTypeLatLng,
		},
		{
			Name:     "latlngheight",
			Input:    dataset.ValueTypeLatLngHeight,
			Expected: ValueTypeLatLngHeight,
		},
		{
			Name:     "string",
			Input:    dataset.ValueTypeString,
			Expected: ValueTypeString,
		},
		{
			Name:     "bool",
			Input:    dataset.ValueTypeBool,
			Expected: ValueTypeBool,
		},
		{
			Name:     "ref",
			Input:    dataset.ValueTypeRef,
			Expected: ValueTypeRef,
		},
		{
			Name:     "url",
			Input:    dataset.ValueTypeURL,
			Expected: ValueTypeURL,
		},
		{
			Name:     "number",
			Input:    dataset.ValueTypeNumber,
			Expected: ValueTypeNumber,
		},
		{
			Name:     "undefined",
			Input:    dataset.ValueType("xxx"),
			Expected: ValueType(""),
		},
	}
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := valueTypeFromDataset(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}
