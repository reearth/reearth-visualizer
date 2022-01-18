package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRoleFromString(t *testing.T) {
	tests := []struct {
		Name, Role string
		Expected   Role
		Err        error
	}{
		{
			Name:     "Success reader",
			Role:     "reader",
			Expected: Role("reader"),
			Err:      nil,
		},
		{
			Name:     "fail invalid role",
			Role:     "xxx",
			Expected: Role("xxx"),
			Err:      ErrInvalidRole,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := RoleFromString(tt.Role)
			if tt.Err == nil {
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}

func TestCheckRole(t *testing.T) {
	tests := []struct {
		Name     string
		Input    Role
		Expected bool
	}{
		{
			Name:     "check reader",
			Input:    Role("reader"),
			Expected: true,
		},
		{
			Name:     "check writer",
			Input:    Role("writer"),
			Expected: true,
		},
		{
			Name:     "check owner",
			Input:    Role("owner"),
			Expected: true,
		},
		{
			Name:     "check unknown role",
			Input:    Role("xxx"),
			Expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := checkRole(tt.Input)
			assert.Equal(t, tt.Expected, res)
		})
	}
}
