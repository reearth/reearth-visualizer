package dataset

type List []*Dataset

func (l List) First() *Dataset {
	if len(l) == 0 {
		return nil
	}
	return l[0]
}

func (l List) Last() *Dataset {
	if len(l) == 0 {
		return nil
	}
	return l[len(l)-1]
}

func (l List) FindDataset(id ID) *Dataset {
	for _, t := range l {
		if t.ID() == id {
			return t
		}
	}
	return nil
}

func (l List) ToDatasetIds() []ID {
	if l == nil {
		return nil
	}

	ids := []ID{}
	for _, t := range l {
		ids = append(ids, t.ID())
	}
	return ids
}

func (l List) FindDatasetBySource(s string) *Dataset {
	for _, t := range l {
		if t.Source() == s {
			return t
		}
	}
	return nil
}

func (l List) FilterByDatasetSchema(s SchemaID) List {
	n := List{}
	for _, t := range l {
		if t.Schema() == s {
			n = append(n, t)
		}
	}
	return n
}

func (l List) DiffBySource(l2 List) Diff {
	// l is old, l2 is new
	added := []*Dataset{}
	removed := []*Dataset{}
	// others := map[string]DatasetDiffTouple{}
	others2 := map[ID]*Dataset{}

	s1 := map[string]*Dataset{}
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

type Map map[ID]*Dataset

func (dm Map) Add(dss ...*Dataset) {
	if dss == nil {
		return
	}
	if dm == nil {
		dm = map[ID]*Dataset{}
	}
	for _, ds := range dss {
		if ds == nil {
			continue
		}
		dm[ds.ID()] = ds
	}
}

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

func (dm Map) GraphSearchByFields(root ID, fields ...FieldID) (List, *Field) {
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
		} else if fids := field.Value().ValueRef(); fids != nil {
			if fid, err := IDFrom(*fids); err == nil {
				currentD = dm[ID(fid)]
			} else {
				return res, nil
			}
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
