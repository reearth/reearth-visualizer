package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLatLngHeight_Clone(t *testing.T) {
	tests := []struct {
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

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.LL.Clone()
			assert.Equal(t, tc.Expected, res)
			if tc.Expected != nil {
				assert.NotSame(t, tc.Expected, res)
			}
		})
	}
}
