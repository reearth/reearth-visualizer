package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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
