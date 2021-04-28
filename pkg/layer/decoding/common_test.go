package decoding

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRgbafToHex(t *testing.T) {
	testCases := []struct {
		name     string
		rgba     []float64
		expected string
		err      error
	}{
		{name: "orange", rgba: []float64{1, 0.6471, 0, 1}, expected: "ffa500ff", err: nil},
		{name: "RGBA length error", rgba: []float64{1, 0.6471, 0, 1, 1}, expected: "", err: ErrBadColor},
		{name: "RGBA greater than 1 error", rgba: []float64{1, 1.6471, 0, 1, 1}, expected: "", err: ErrBadColor},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res, err := rgbafToHex(tc.rgba)
			if tc.err == nil {
				assert.NoError(tt, err)
				assert.Equal(tt, tc.expected, res)
			} else {
				assert.True(tt, errors.As(err, &tc.err))
			}
		})
	}
}

func TestRgbaToHex(t *testing.T) {
	testCases := []struct {
		name     string
		rgba     []int64
		expected string
		err      error
	}{
		{name: "orange", rgba: []int64{255, 165, 0, 255}, expected: "ffa500ff", err: nil},
		{name: "RGBA length error", rgba: []int64{255, 165, 0}, expected: "", err: ErrBadColor},
		{name: "RGBA bad boundaries ", rgba: []int64{400, 165, 0, 1}, expected: "", err: ErrBadColor},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			res, err := rgbaToHex(tc.rgba)
			if err == nil {
				assert.Equal(tt, tc.expected, res)
			} else {
				assert.True(tt, errors.As(err, &tc.err))
			}
		})
	}
}
