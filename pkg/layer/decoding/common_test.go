package decoding

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRgbafToHex(t *testing.T) {
	tests := []struct {
		name     string
		rgba     []float64
		expected string
		err      error
	}{
		{
			name:     "orange",
			rgba:     []float64{1, 0.6471, 0, 1},
			expected: "ffa500ff",
			err:      nil},
		{
			name:     "RGBA length error",
			rgba:     []float64{1, 0.6471, 0, 1, 1},
			expected: "",
			err:      ErrBadColor},
		{
			name:     "RGBA greater than 1 error",
			rgba:     []float64{1, 1.6471, 0, 1, 1},
			expected: "",
			err:      ErrBadColor},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res, err := rgbafToHex(tt.rgba)
			if tt.err == nil {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, res)
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestRgbaToHex(t *testing.T) {
	tests := []struct {
		name     string
		rgba     []int64
		expected string
		err      error
	}{
		{
			name:     "orange",
			rgba:     []int64{255, 165, 0, 255},
			expected: "ffa500ff",
			err:      nil},
		{
			name:     "RGBA length error",
			rgba:     []int64{255, 165, 0},
			expected: "",
			err:      ErrBadColor},
		{
			name:     "RGBA bad boundaries ",
			rgba:     []int64{400, 165, 0, 1},
			expected: "",
			err:      ErrBadColor},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res, err := rgbaToHex(tt.rgba)
			if tt.err == nil {
				assert.Equal(t, tt.expected, res)
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}
