package dataset

import "github.com/reearth/reearth-backend/pkg/id"

// GraphIterator は、データセットをグラフ探索するためのイテレータです。
type GraphIterator struct {
	m                 Map
	ids               [][]id.DatasetID
	currentIndex      int
	currentDepthIndex int
	maxDepth          int
}

// GraphIteratorFrom _
func GraphIteratorFrom(root id.DatasetID, depth int) *GraphIterator {
	return &GraphIterator{
		ids:      [][]id.DatasetID{{root}},
		maxDepth: depth,
	}
}

// Next _
func (di *GraphIterator) Next(d *Dataset) (id.DatasetID, bool) {
	if di == nil || di.maxDepth == 0 || di.ids == nil || len(di.ids) == 0 || d == nil {
		return id.DatasetID{}, false
	}
	if di.currentDepthIndex >= len(di.ids) {
		return id.DatasetID{}, true
	}

	if di.m == nil {
		di.m = Map{}
	}
	di.m[d.ID()] = d

	// add fields
	if len(di.ids) <= di.currentDepthIndex+1 {
		di.ids = append(di.ids, []id.DatasetID{})
	}
	nextDepthIDs := di.ids[di.currentDepthIndex+1]
	currentIDs := di.ids[di.currentDepthIndex]
	for _, f := range d.Fields() {
		if r := f.Value().ValueRef(); r != nil {
			nextDepthIDs = append(nextDepthIDs, id.DatasetID(*r))
		}
	}
	di.ids[di.currentDepthIndex+1] = nextDepthIDs

	// next
	if di.currentIndex == len(currentIDs)-1 {
		di.currentIndex = 0
		// next depth
		if di.maxDepth <= di.currentDepthIndex || len(nextDepthIDs) == 0 {
			// done
			di.currentDepthIndex++
			return id.DatasetID{}, true
		}
		di.currentDepthIndex++
	} else {
		di.currentIndex++
	}

	return di.ids[di.currentDepthIndex][di.currentIndex], false
}

// Result _
func (di *GraphIterator) Result() Map {
	if di == nil {
		return nil
	}
	return di.m
}
