package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCondition_Clone(t *testing.T) {
	tests := []struct {
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

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Con.Clone()
			assert.Equal(t, tt.Expected, res)
		})
	}
}
