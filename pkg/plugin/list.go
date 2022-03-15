package plugin

import "sort"

type List []*Plugin

func (l List) Find(p ID) *Plugin {
	for _, q := range l {
		if q.ID().Equal(p) {
			return q
		}
	}
	return nil
}

func (l List) Concat(m List) List {
	return append(l, m...)
}

func (l List) MapToIDs(ids []ID) List {
	res := make(List, 0, len(ids))
	for _, id := range ids {
		res = append(res, l.Find(id))
	}
	return res
}

func (l List) Map() Map {
	m := make(Map, len(l))
	for _, p := range l {
		m[p.ID()] = p
	}
	return m
}

type Map map[ID]*Plugin

func (m Map) List() List {
	if m == nil {
		return nil
	}
	res := make(List, 0, len(m))
	for _, p := range m {
		res = append(res, p)
	}
	sort.SliceStable(res, func(i, j int) bool {
		return res[i].ID().String() > res[j].ID().String()
	})
	return res
}
