package asset

type SortType struct {
	Key  string
	Desc bool
}

var (
	SortTypeID        = SortType{Key: "id"}
	SortTypeSize = SortType{Key: "size"}
	SortTypeName      = SortType{Key: "name"}
)
