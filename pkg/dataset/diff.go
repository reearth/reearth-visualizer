package dataset

type Diff struct {
	Added   List
	Removed List
	Others  map[ID]*Dataset
}
