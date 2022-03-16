package asset

import (
	"errors"
	"strings"
)

var (
	SortTypeID   = SortType("id")
	SortTypeName = SortType("name")
	SortTypeSize = SortType("size")

	ErrInvalidSortType = errors.New("invalid sort type")
)

type SortType string

func check(role SortType) bool {
	switch role {
	case SortTypeID:
		return true
	case SortTypeName:
		return true
	case SortTypeSize:
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
