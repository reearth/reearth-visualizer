package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLatLng_Clone(t *testing.T) {
	tests := []struct {
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

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.LL.Clone()
			assert.Equal(tt, tc.Expected, res)
			if tc.Expected != nil {
				assert.NotSame(tt, tc.Expected, res)
			}
		})
	}
}
