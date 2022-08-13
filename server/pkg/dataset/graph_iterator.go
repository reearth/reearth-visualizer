package dataset

// GraphIterator is a iterator for graphically exploring a dataset.
type GraphIterator struct {
	m                 Map
	ids               [][]ID
	currentIndex      int
	currentDepthIndex int
	maxDepth          int
}

func GraphIteratorFrom(root ID, depth int) *GraphIterator {
	return &GraphIterator{
		ids:      [][]ID{{root}},
		maxDepth: depth,
	}
}

func (di *GraphIterator) Next(d *Dataset) (ID, bool) {
	if di == nil || di.maxDepth == 0 || len(di.ids) == 0 || d == nil {
		return ID{}, false
	}
	if di.currentDepthIndex >= len(di.ids) {
		return ID{}, true
	}

	if di.m == nil {
		di.m = Map{}
	}
	di.m[d.ID()] = d

	// add fields
	if len(di.ids) <= di.currentDepthIndex+1 {
		di.ids = append(di.ids, []ID{})
	}
	nextDepthIDs := di.ids[di.currentDepthIndex+1]
	currentIDs := di.ids[di.currentDepthIndex]
	for _, f := range d.Fields() {
		if r := f.Value().ValueRef(); r != nil {
			if rid, err := IDFrom(*r); err == nil {
				nextDepthIDs = append(nextDepthIDs, rid)
			}
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
			return ID{}, true
		}
		di.currentDepthIndex++
	} else {
		di.currentIndex++
	}

	return di.ids[di.currentDepthIndex][di.currentIndex], false
}

func (di *GraphIterator) Result() Map {
	if di == nil {
		return nil
	}
	return di.m
}
