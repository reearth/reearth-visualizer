package tag

import "sort"

type Map map[ID]Tag

func (m Map) All() List {
	if len(m) == 0 {
		return nil
	}
	res := make(List, 0, len(m))
	for _, t := range m {
		res = append(res, t)
	}
	sort.SliceStable(res, func(i, j int) bool {
		return res[i].ID().Compare(res[j].ID()) < 0
	})
	return res
}

func MapFromList(tags []Tag) Map {
	res := make(Map)
	for _, t := range tags {
		if t == nil {
			continue
		}

		res[t.ID()] = t
	}
	return res
}

func MapFromRefList(tags []*Tag) Map {
	res := make(Map)
	for _, t := range tags {
		if t == nil {
			continue
		}

		t2 := *t
		if t2 == nil {
			continue
		}

		res[t2.ID()] = t2
	}
	return res
}
