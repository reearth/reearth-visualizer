package shp

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBox_ExtendWithPoint(t *testing.T) {
	tests := []struct {
		name  string
		input struct {
			b Box
			p Point
		}
		expected Box
	}{
		{
			name: "MaxY",
			input: struct {
				b Box
				p Point
			}{
				b: Box{0, 0, 1, 1},
				p: Point{0, 2}},
			expected: Box{
				MinX: 0,
				MinY: 0,
				MaxX: 1,
				MaxY: 2,
			},
		},
		{
			name: "MaxX",
			input: struct {
				b Box
				p Point
			}{
				b: Box{0, 0, 1, 1},
				p: Point{2, 0}},
			expected: Box{
				MinX: 0,
				MinY: 0,
				MaxX: 2,
				MaxY: 1,
			},
		},
		{
			name: "MinX",
			input: struct {
				b Box
				p Point
			}{
				b: Box{0, 0, 1, 1},
				p: Point{-1, 0}},
			expected: Box{
				MinX: -1,
				MinY: 0,
				MaxX: 1,
				MaxY: 1,
			},
		},
		{
			name: "MinY",
			input: struct {
				b Box
				p Point
			}{
				b: Box{0, 0, 1, 1},
				p: Point{0, -1}},
			expected: Box{
				MinX: 0,
				MinY: -1,
				MaxX: 1,
				MaxY: 1,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			tc.input.b.ExtendWithPoint(tc.input.p)
			assert.Equal(t, tc.expected, tc.input.b)
		})
	}

}

func TestBox_Extend(t *testing.T) {
	a := Box{-124.763068, 45.543541, -116.915989, 49.002494}
	b := Box{-92.888114, 42.49192, -86.805415, 47.080621}
	a.Extend(b)
	c := Box{-124.763068, 42.49192, -86.805415, 49.002494}
	if a.MinX != c.MinX {
		t.Errorf("a.MinX = %v, want %v", a.MinX, c.MinX)
	}
	if a.MinY != c.MinY {
		t.Errorf("a.MinY = %v, want %v", a.MinY, c.MinY)
	}
	if a.MaxX != c.MaxX {
		t.Errorf("a.MaxX = %v, want %v", a.MaxX, c.MaxX)
	}
	if a.MaxY != c.MaxY {
		t.Errorf("a.MaxY = %v, want %v", a.MaxY, c.MaxY)
	}
}

func TestNewPolyLine(t *testing.T) {
	points := [][]Point{
		{Point{0.0, 0.0}, Point{5.0, 5.0}},
		{Point{10.0, 10.0}, Point{15.0, 15.0}},
	}
	polyLine := NewPolyLine(points)

	expected := &PolyLine{
		Box:       Box{MinX: 0, MinY: 0, MaxX: 15, MaxY: 15},
		NumParts:  2,
		NumPoints: 4,
		Parts:     []int32{0, 2},
		Points: []Point{
			{X: 0, Y: 0},
			{X: 5, Y: 5},
			{X: 10, Y: 10},
			{X: 15, Y: 15},
		},
	}

	assert.Equal(t, expected, polyLine)
}

func TestBBoxFromPoints(t *testing.T) {
	tests := []struct {
		name     string
		input    []Point
		expected Box
	}{
		{
			name: "Single point",
			input: []Point{{
				X: 1,
				Y: 1,
			}},
			expected: Box{
				MinX: 1,
				MinY: 1,
				MaxX: 1,
				MaxY: 1,
			},
		},
		{
			name: "Tow points",
			input: []Point{{
				X: 1,
				Y: 1,
			}, {
				X: 0,
				Y: 0,
			}},
			expected: Box{
				MinX: 0,
				MinY: 0,
				MaxX: 1,
				MaxY: 1,
			},
		},
		{
			name: "Multi points",
			input: []Point{{
				X: 2,
				Y: 2,
			}, {
				X: 0,
				Y: 0,
			}, {
				X: 1,
				Y: 3,
			}},
			expected: Box{
				MinX: 0,
				MinY: 0,
				MaxX: 2,
				MaxY: 3,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.expected, BBoxFromPoints(tc.input))
		})
	}
}
