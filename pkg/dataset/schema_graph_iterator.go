package dataset

// SchemaGraphIterator は、データセットをグラフ探索するためのイテレータです。
type SchemaGraphIterator struct {
	m                 SchemaMap
	ids               [][]SchemaID
	currentIndex      int
	currentDepthIndex int
	maxDepth          int
}

func SchemaGraphIteratorFrom(root SchemaID, depth int) *SchemaGraphIterator {
	return &SchemaGraphIterator{
		ids:      [][]SchemaID{{root}},
		maxDepth: depth,
	}
}

func (di *SchemaGraphIterator) Next(d *Schema) (SchemaID, bool) {
	if di == nil || di.maxDepth == 0 || di.ids == nil || len(di.ids) == 0 || d == nil {
		return SchemaID{}, false
	}
	if di.currentDepthIndex >= len(di.ids) {
		return SchemaID{}, true
	}

	if di.m == nil {
		di.m = SchemaMap{}
	}
	di.m[d.ID()] = d

	// add fields
	if len(di.ids) <= di.currentDepthIndex+1 {
		di.ids = append(di.ids, []SchemaID{})
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
			return SchemaID{}, true
		}
		di.currentDepthIndex++
	} else {
		di.currentIndex++
	}

	return di.ids[di.currentDepthIndex][di.currentIndex], false
}

func (di *SchemaGraphIterator) Result() SchemaMap {
	if di == nil {
		return nil
	}
	return di.m
}
