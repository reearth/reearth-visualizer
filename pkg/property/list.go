package property

import (
	"sort"

	"github.com/reearth/reearth-backend/pkg/id"
)

type List []*Property

func (l List) Schemas() []id.PropertySchemaID {
	schemas := make([]id.PropertySchemaID, 0, len(l))
	m := map[id.PropertySchemaID]struct{}{}
	for _, p := range l {
		s := p.Schema()
		if _, ok := m[s]; ok {
			continue
		}
		schemas = append(schemas, s)
		m[s] = struct{}{}
	}
	return schemas
}

func (l List) Map() Map {
	m := make(Map, len(l))
	return m.Add(l...)
}

type Map map[id.PropertyID]*Property

func MapFrom(properties ...*Property) Map {
	return Map{}.Add(properties...)
}

func (m Map) Add(properties ...*Property) Map {
	if m == nil {
		m = Map{}
	}
	for _, p := range properties {
		if p == nil {
			continue
		}
		m[p.ID()] = p
	}
	return m
}

func (m Map) List() List {
	if m == nil {
		return nil
	}
	list := make(List, 0, len(m))
	for _, l := range m {
		list = append(list, l)
	}
	return list
}

func (m Map) Clone() Map {
	if m == nil {
		return Map{}
	}
	m2 := make(Map, len(m))
	for k, v := range m {
		m2[k] = v
	}
	return m2
}

func (m Map) Merge(m2 Map) Map {
	if m == nil {
		return m2.Clone()
	}
	m3 := m.Clone()
	if m2 == nil {
		return m3
	}

	return m3.Add(m2.List()...)
}

func (m Map) Keys() []id.PropertyID {
	keys := make([]id.PropertyID, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.SliceStable(keys, func(i, j int) bool {
		return id.ID(keys[i]).Compare(id.ID(keys[j])) < 0
	})
	return keys
}

func (m Map) Len() int {
	return len(m)
}
