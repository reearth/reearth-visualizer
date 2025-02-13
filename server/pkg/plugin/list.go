package plugin

import (
	"sort"

	"github.com/reearth/reearth/server/pkg/id"
)

type PluginList []*Plugin

func (l PluginList) Find(p id.PluginID) *Plugin {
	for _, q := range l {
		if q.ID().Equal(p) {
			return q
		}
	}
	return nil
}

func (l PluginList) Concat(m PluginList) PluginList {
	return append(l, m...)
}

func (l PluginList) MapToIDs(ids []id.PluginID) PluginList {
	res := make(PluginList, 0, len(ids))
	for _, id := range ids {
		res = append(res, l.Find(id))
	}
	return res
}

func (l PluginList) Map() Map {
	m := make(Map, len(l))
	for _, p := range l {
		m[p.ID()] = p
	}
	return m
}

type Map map[id.PluginID]*Plugin

func (m Map) List() PluginList {
	if m == nil {
		return nil
	}
	res := make(PluginList, 0, len(m))
	for _, p := range m {
		res = append(res, p)
	}
	sort.SliceStable(res, func(i, j int) bool {
		return res[i].ID().String() > res[j].ID().String()
	})
	return res
}
