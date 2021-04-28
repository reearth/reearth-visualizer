package dataset

import "github.com/reearth/reearth-backend/pkg/id"

// SchemaGraphIterator は、データセットをグラフ探索するためのイテレータです。
type SchemaGraphIterator struct {
	m                 SchemaMap
	ids               [][]id.DatasetSchemaID
	currentIndex      int
	currentDepthIndex int
	maxDepth          int
}

// SchemaGraphIteratorFrom _
func SchemaGraphIteratorFrom(root id.DatasetSchemaID, depth int) *SchemaGraphIterator {
	return &SchemaGraphIterator{
		ids:      [][]id.DatasetSchemaID{{root}},
		maxDepth: depth,
	}
}

// Next _
func (di *SchemaGraphIterator) Next(d *Schema) (id.DatasetSchemaID, bool) {
	if di == nil || di.maxDepth == 0 || di.ids == nil || len(di.ids) == 0 || d == nil {
		return id.DatasetSchemaID{}, false
	}
	if di.currentDepthIndex >= len(di.ids) {
		return id.DatasetSchemaID{}, true
	}

	if di.m == nil {
		di.m = SchemaMap{}
	}
	di.m[d.ID()] = d

	// add fields
	if len(di.ids) <= di.currentDepthIndex+1 {
		di.ids = append(di.ids, []id.DatasetSchemaID{})
	}
	nextDepthIDs := di.ids[di.currentDepthIndex+1]
	currentIDs := di.ids[di.currentDepthIndex]
	for _, f := range d.Fields() {
		if r := f.Ref(); r != nil {
			nextDepthIDs = append(nextDepthIDs, *r)
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
			return id.DatasetSchemaID{}, true
		}
		di.currentDepthIndex++
	} else {
		di.currentIndex++
	}

	return di.ids[di.currentDepthIndex][di.currentIndex], false
}

// Result _
func (di *SchemaGraphIterator) Result() SchemaMap {
	if di == nil {
		return nil
	}
	return di.m
}
