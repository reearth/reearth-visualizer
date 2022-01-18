package shp

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestShapeType_String(t *testing.T) {
	tests := []struct {
		name     string
		input    ShapeType
		expected string
	}{
		{
			name:     "NULL",
			input:    0,
			expected: "NULL",
		},
		{
			name:     "POINT",
			input:    1,
			expected: "POINT",
		},
		{
			name:     "POLYLINE",
			input:    3,
			expected: "POLYLINE",
		},
		{
			name:     "POLYGON",
			input:    5,
			expected: "POLYGON",
		},
		{
			name:     "MULTIPOINT",
			input:    8,
			expected: "MULTIPOINT",
		},
		{
			name:     "POINTZ",
			input:    11,
			expected: "POINTZ",
		},
		{
			name:     "POLYLINEZ",
			input:    13,
			expected: "POLYLINEZ",
		},
		{
			name:     "POLYGONZ",
			input:    15,
			expected: "POLYGONZ",
		},
		{
			name:     "MULTIPOINTZ",
			input:    18,
			expected: "MULTIPOINTZ",
		},
		{
			name:     "POINTM",
			input:    21,
			expected: "POINTM",
		},
		{
			name:     "POLYLINEM",
			input:    23,
			expected: "POLYLINEM",
		},
		{
			name:     "POLYGONM",
			input:    25,
			expected: "POLYGONM",
		},
		{
			name:     "MULTIPOINTM",
			input:    28,
			expected: "MULTIPOINTM",
		},
		{
			name:     "MULTIPATCH",
			input:    31,
			expected: "MULTIPATCH",
		},
		{
			name:     "MULTIPATCH",
			input:    -1,
			expected: "ShapeType(-1)",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.expected, tc.input.String())
		})
	}
}
