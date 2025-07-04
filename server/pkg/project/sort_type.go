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
