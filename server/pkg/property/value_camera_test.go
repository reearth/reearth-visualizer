package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCamera_Clone(t *testing.T) {
	tests := []struct {
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

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Camera.Clone()
			assert.Equal(t, tc.Expected, res)
			if tc.Expected != nil {
				assert.NotSame(t, tc.Expected, res)
			}
		})
	}
}
