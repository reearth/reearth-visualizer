package dataset

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

// List _
type List []*Dataset

// First _
func (l List) First() *Dataset {
	if l == nil || len(l) == 0 {
		return nil
	}
	return l[0]
}

// Last _
func (l List) Last() *Dataset {
	if l == nil || len(l) == 0 {
		return nil
	}
	return l[len(l)-1]
}

// FindDataset _
func (l List) FindDataset(id id.DatasetID) *Dataset {
	for _, t := range l {
		if t.ID() == id {
			return t
		}
	}
	return nil
}

// ToDatasetIds _
func (l List) ToDatasetIds() []id.DatasetID {
	if l == nil {
		return nil
	}

	ids := []id.DatasetID{}
	for _, t := range l {
		ids = append(ids, t.ID())
	}
	return ids
}

// FindDatasetBySource _
func (l List) FindDatasetBySource(s Source) *Dataset {
	for _, t := range l {
		if t.Source() == s {
			return t
		}
	}
	return nil
}

// FilterByDatasetSchema _
func (l List) FilterByDatasetSchema(s id.DatasetSchemaID) List {
	n := List{}
	for _, t := range l {
		if t.Schema() == s {
			n = append(n, t)
		}
	}
	return n
}

// DiffBySource _
func (l List) DiffBySource(l2 List) Diff {
	// l is old, l2 is new
	added := []*Dataset{}
	removed := []*Dataset{}
	// others := map[DatasetSource]DatasetDiffTouple{}
	others2 := map[id.DatasetID]*Dataset{}

	s1 := map[Source]*Dataset{}
	for _, d1 := range l {
		s1[d1.Source()] = d1
	}

	for _, d2 := range l2 {
		if d1, ok := s1[d2.Source()]; ok {
			// others
			// others[d2.Source()] = DatasetDiffTouple{Old: d1, New: d2}
			others2[d1.ID()] = d2
		} else {
			// added
			added = append(added, d2)
		}
	}

	for _, d1 := range l {
		if _, ok := others2[d1.ID()]; !ok {
			// removed
			removed = append(removed, d1)
		}
	}

	return Diff{
		Added:   added,
		Removed: removed,
		Others:  others2,
		// Others: others,
	}
}

// Map _
func (l List) Map() Map {
	if l == nil {
		return nil
	}
	m := Map{}
	for _, d := range l {
		if d != nil {
			m[d.ID()] = d
		}
	}
	return m
}

func (l List) Loader() Loader {
	return LoaderFrom(l)
}

func (l List) GraphLoader() GraphLoader {
	return GraphLoaderFromMap(l.Map())
}

// Map _
type Map map[id.DatasetID]*Dataset

// Add _
func (dm Map) Add(dss ...*Dataset) {
	if dss == nil {
		return
	}
	if dm == nil {
		dm = map[id.DatasetID]*Dataset{}
	}
	for _, ds := range dss {
		if ds == nil {
			continue
		}
		dm[ds.ID()] = ds
	}
}

// Slice _
func (dm Map) Slice() List {
	if dm == nil {
		return nil
	}
	res := make(List, 0, len(dm))
	for _, d := range dm {
		res = append(res, d)
	}
	return res
}

// GraphSearchByFields _
func (dm Map) GraphSearchByFields(root id.DatasetID, fields ...id.DatasetSchemaFieldID) (List, *Field) {
	res := make(List, 0, len(fields))
	currentD := dm[root]
	if currentD == nil {
		return res, nil
	}
	for i, f := range fields {
		if currentD == nil {
			return res, nil
		}
		res = append(res, currentD)
		field := currentD.Field(f)
		if field == nil {
			return res, nil
		}
		if len(fields)-1 == i {
			return res, field
		} else if fid := field.Value().ValueRef(); fid != nil {
			currentD = dm[id.DatasetID(*fid)]
		} else {
			return res, nil
		}
	}
	return res, nil
}

func (dm Map) Loader() Loader {
	return LoaderFromMap(dm)
}

func (dm Map) GraphLoader() GraphLoader {
	return GraphLoaderFromMap(dm)
}
