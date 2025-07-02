package project

type SortType struct {
	Key  string
	Desc bool
}

var (
	SortTypeID        = SortType{Key: "id"}
	SortTypeUpdatedAt = SortType{Key: "updatedat"}
	SortTypeName      = SortType{Key: "name"}
)

// func SortTypeFromString(r string, desc bool) SortType {
// 	switch strings.ToLower(r) {
// 	case "id":
// 		return SortType{Key: "id", Desc: desc}
// 	case "updatedat":
// 		return SortType{Key: "updatedat", Desc: desc}
// 	case "name":
// 		return SortType{Key: "name", Desc: desc}
// 	default:
// 		return SortType{Key: "id", Desc: desc} // Default to ID sorting
// 	}
// }
