package dataset

import "github.com/reearth/reearth-backend/pkg/id"

// Diff _
type Diff struct {
	Added   List
	Removed List
	Others  map[id.DatasetID]*Dataset
}
