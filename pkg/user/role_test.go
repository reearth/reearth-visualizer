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

func TestRole_Includes(t *testing.T) {
	tests := []struct {
		Name     string
		Target   Role
		Input    Role
		Expected bool
	}{
		{
			Name:     "reader and readner",
			Target:   RoleReader,
			Input:    RoleReader,
			Expected: true,
		},
		{
			Name:     "reader and writer",
			Target:   RoleReader,
			Input:    RoleWriter,
			Expected: false,
		},
		{
			Name:     "reader and owner",
			Target:   RoleReader,
			Input:    RoleOwner,
			Expected: false,
		},
		{
			Name:     "writer and readner",
			Target:   RoleWriter,
			Input:    RoleReader,
			Expected: true,
		},
		{
			Name:     "writer and writer",
			Target:   RoleWriter,
			Input:    RoleWriter,
			Expected: true,
		},
		{
			Name:     "writer and owner",
			Target:   RoleWriter,
			Input:    RoleOwner,
			Expected: false,
		},
		{
			Name:     "owner and readner",
			Target:   RoleOwner,
			Input:    RoleReader,
			Expected: true,
		},
		{
			Name:     "owner and writer",
			Target:   RoleOwner,
			Input:    RoleWriter,
			Expected: true,
		},
		{
			Name:     "owner and owner",
			Target:   RoleOwner,
			Input:    RoleOwner,
			Expected: true,
		},
		{
			Name:     "unknown role",
			Target:   Role("xxx"),
			Input:    Role("yyy"),
			Expected: false,
		},
		{
			Name:     "unknown role 2",
			Target:   RoleOwner,
			Input:    Role("yyy"),
			Expected: false,
		},
		{
			Name:     "unknown role 3",
			Target:   Role("xxx"),
			Input:    RoleOwner,
			Expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Target.Includes(tt.Input)
			assert.Equal(t, tt.Expected, res)
		})
	}
}
