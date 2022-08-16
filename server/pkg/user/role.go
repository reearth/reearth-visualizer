package user

import (
	"errors"
	"strings"
)

var (
	// RoleOwner is a role who can have full controll of project
	RoleOwner = Role("owner")
	// RoleWriter is a role who can read and write project
	RoleWriter = Role("writer")
	// RoleReader is a role who can read project
	RoleReader = Role("reader")

	roles = []Role{
		RoleOwner,
		RoleWriter,
		RoleReader,
	}

	ErrInvalidRole = errors.New("invalid role")
)

type Role string

func checkRole(role Role) bool {
	switch role {
	case RoleOwner:
		return true
	case RoleWriter:
		return true
	case RoleReader:
		return true
	}
	return false
}

func RoleFromString(r string) (Role, error) {
	role := Role(strings.ToLower(r))

	if checkRole(role) {
		return role, nil
	}
	return role, ErrInvalidRole
}

func (r Role) Includes(role Role) bool {
	for i, r2 := range roles {
		if r == r2 {
			for _, r3 := range roles[i:] {
				if role == r3 {
					return true
				}
			}
		}
	}
	return false
}
