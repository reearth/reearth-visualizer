package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSpacing_Clone(t *testing.T) {
	tests := []struct {
		Name              string
		Spacing, Expected *Spacing
	}{
		{
			Name: "nil Spacing",
		},
		{
			Name: "cloned",
			Spacing: &Spacing{
				Top:    1,
				Bottom: 1,
				Left:   2,
				Right:  4,
			},
			Expected: &Spacing{
				Top:    1,
				Bottom: 1,
				Left:   2,
				Right:  4,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Spacing.Clone()
			assert.Equal(t, tc.Expected, res)
			if tc.Expected != nil {
				assert.NotSame(t, tc.Expected, res)
			}
		})
	}
}
