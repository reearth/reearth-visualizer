package asset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSortTypeFromString(t *testing.T) {
	tests := []struct {
		Name, Role string
		Expected   SortType
		Err        error
	}{
		{
			Name:     "Success id",
			Role:     "id",
			Expected: SortType("id"),
			Err:      nil,
		},
		{
			Name:     "fail invalid sort type",
			Role:     "xxx",
			Expected: SortType("xxx"),
			Err:      ErrInvalidSortType,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := SortTypeFromString(tt.Role)
			if tt.Err == nil {
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}

func TestCheck(t *testing.T) {
	tests := []struct {
		Name     string
		Input    SortType
		Expected bool
	}{
		{
			Name:     "check id",
			Input:    SortType("id"),
			Expected: true,
		},
		{
			Name:     "check name",
			Input:    SortType("name"),
			Expected: true,
		},
		{
			Name:     "check size",
			Input:    SortType("size"),
			Expected: true,
		},
		{
			Name:     "check unknown sort type",
			Input:    SortType("xxx"),
			Expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := check(tt.Input)
			assert.Equal(t, tt.Expected, res)
		})
	}
}
