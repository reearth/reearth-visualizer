package user

import (
	"errors"
	"strings"
)

var (
	// RoleReader is a role who can read project
	RoleReader = Role("reader")
	// RoleWriter is a role who can read and write project
	RoleWriter = Role("writer")
	// RoleOwner is a role who can have full controll of project
	RoleOwner = Role("owner")
	// ErrInvalidRole _
	ErrInvalidRole = errors.New("invalid role")
)

// Role _
type Role string

func checkRole(role Role) bool {
	switch role {
	case RoleReader:
		return true
	case RoleWriter:
		return true
	case RoleOwner:
		return true
	}
	return false
}

// RoleFromString _
func RoleFromString(r string) (Role, error) {
	role := Role(strings.ToLower(r))

	if checkRole(role) {
		return role, nil
	}
	return role, ErrInvalidRole
}
