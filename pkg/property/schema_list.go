package property

import "github.com/reearth/reearth-backend/pkg/id"

type SchemaList []*Schema

func (l SchemaList) Map() SchemaMap {
	return SchemaMapFrom(l)
}

type SchemaMap map[id.PropertySchemaID]*Schema

func SchemaMapFrom(l []*Schema) SchemaMap {
	m := make(SchemaMap, len(l))
	m.Add(l...)
	return m
}

func (m SchemaMap) Add(schemas ...*Schema) {
	if m == nil {
		return
	}
	for _, p := range schemas {
		if p == nil {
			continue
		}
		m[p.ID()] = p
	}
}

func (m SchemaMap) List() SchemaList {
	if m == nil {
		return nil
	}
	list := make(SchemaList, 0, len(m))
	for _, l := range m {
		list = append(list, l)
	}
	return list
}

func (m SchemaMap) Clone() SchemaMap {
	if m == nil {
		return SchemaMap{}
	}
	m2 := make(SchemaMap, len(m))
	for k, v := range m {
		m2[k] = v
	}
	return m2
}

func (m SchemaMap) Merge(m2 SchemaMap) SchemaMap {
	if m == nil {
		return nil
	}
	m3 := m.Clone()
	if m2 == nil {
		return m3
	}

	m3.Add(m2.List()...)

	return m3
}
