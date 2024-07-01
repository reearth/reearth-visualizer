package project

import (
	"errors"
	"strings"
)

var (
	SortTypeID        = SortType("id")
	SortTypeUpdatedAt = SortType("updatedAt")
	SortTypeName      = SortType("name")

	ErrInvalidSortType = errors.New("invalid sort type")
)

type SortType string

func check(role SortType) bool {
	switch role {
	case SortTypeID:
		return true
	case SortTypeUpdatedAt:
		return true
	case SortTypeName:
		return true
	}
	return false
}

func SortTypeFromString(r string) (SortType, error) {
	role := SortType(strings.ToLower(r))

	if check(role) {
		return role, nil
	}
	return role, ErrInvalidSortType
}
