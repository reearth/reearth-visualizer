package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCondition_Clone(t *testing.T) {
	testCases := []struct {
		Name          string
		Con, Expected *Condition
	}{
		{
			Name:     "nil condition",
			Con:      nil,
			Expected: nil,
		},
		{
			Name: "nil condition",
			Con: &Condition{
				Field: "a",
				Value: ValueTypeBool.ValueFrom(true),
			},
			Expected: &Condition{
				Field: "a",
				Value: ValueTypeBool.ValueFrom(true),
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Con.Clone()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}
