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
			Input: dataset.ValueTypeLatLng.ValueFrom(dataset.LatLng{
				Lat: 10,
				Lng: 12,
			}),
			Expected: struct {
				V  *Value
				Ok bool
			}{
				V: ValueTypeLatLng.ValueFrom(LatLng{
					Lat: 10,
					Lng: 12,
				}),
				Ok: true,
			},
		},
		{
			Name: "LatLngHeight",
			Input: dataset.ValueTypeLatLngHeight.ValueFrom(dataset.LatLngHeight{
				Lat:    10,
				Lng:    12,
				Height: 14,
			}),
			Expected: struct {
				V  *Value
				Ok bool
			}{
				V: ValueTypeLatLngHeight.ValueFrom(LatLngHeight{
					Lat:    10,
					Lng:    12,
					Height: 14,
				}),
				Ok: true,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected.V, valueFromDataset(tc.Input))
		})
	}
}
