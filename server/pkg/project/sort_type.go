package project

import "strings"

type SortType struct {
	Key  string
	Desc bool
}

var (
	SortTypeID        = SortType{Key: "id"}
	SortTypeUpdatedAt = SortType{Key: "updatedAt"}
	SortTypeName      = SortType{Key: "name"}
)

func SortTypeFromString(r string, desc bool) SortType {
	switch strings.ToLower(r) {
	case "id":
		return SortType{Key: "id", Desc: desc}
	case "updatedAt":
		return SortType{Key: "updatedAt", Desc: desc}
	case "name":
		return SortType{Key: "name", Desc: desc}
	default:
		return SortType{Key: "id", Desc: desc} // Default to ID sorting
	}
}
