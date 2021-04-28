package user

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRoleFromString(t *testing.T) {
	testCases := []struct {
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

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := RoleFromString(tc.Role)
			if err == nil {
				assert.Equal(tt, tc.Expected, res)
			} else {
				assert.True(tt, errors.As(err, &tc.Err))
			}
		})
	}
}

func TestCheckRole(t *testing.T) {
	testCases := []struct {
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

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := checkRole(tc.Input)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}
