package layer

type List []*Layer

func (ll List) Last() *Layer {
	if len(ll) == 0 {
		return nil
	}
	return ll[len(ll)-1]
}

func (ll List) IDs() *IDList {
	if len(ll) == 0 {
		return nil
	}
	ids := make([]ID, 0, len(ll))
	for _, l := range ll.Deref() {
		ids = append(ids, l.ID())
	}
	return NewIDList(ids)
}

func (ll List) Properties() []PropertyID {
	if len(ll) == 0 {
		return nil
	}
	ids := make([]PropertyID, 0, len(ll))
	for _, l := range ll.Deref() {
		ids = append(ids, l.Properties()...)
	}
	return ids
}

func (ll List) Pick(il *IDList) List {
	if il == nil {
		return nil
	}

	layers := make(List, 0, il.LayerCount())
	for _, lid := range il.Layers() {
		if l := ll.Find(lid); l != nil {
			layers = append(layers, l)
		}
	}
	return layers
}

func (ll List) Find(lid ID) *Layer {
	for _, l := range ll {
		if l == nil {
			continue
		}
		if (*l).ID() == lid {
			return l
		}
	}
	return nil
}

func (ll List) FindByDataset(ds DatasetID) *Item {
	for _, l := range ll {
		if li := ItemFromLayerRef(l); li != nil {
			dsid := li.LinkedDataset()
			if dsid != nil && *dsid == ds {
				return li
			}
		}
	}
	return nil
}

func (ll List) ToLayerItemList() ItemList {
	res := make(ItemList, 0, len(ll))
	for _, l := range ll {
		if li := ItemFromLayerRef(l); li != nil {
			res = append(res, li)
		}
	}
	return res
}

func (ll List) ToLayerGroupList() GroupList {
	res := make(GroupList, 0, len(ll))
	for _, l := range ll {
		if lg := GroupFromLayerRef(l); lg != nil {
			res = append(res, lg)
		}
	}
	return res
}

func (ll List) SeparateLayerItemAndGroup() (ItemList, GroupList) {
	resi := make(ItemList, 0, len(ll))
	resg := make(GroupList, 0, len(ll))
	for _, l := range ll {
		if lg := GroupFromLayerRef(l); lg != nil {
			resg = append(resg, lg)
		} else if li := ItemFromLayerRef(l); li != nil {
			resi = append(resi, li)
		}
	}
	return resi, resg
}

func (ll List) Deref() []Layer {
	if ll == nil {
		return nil
	}
	res := make([]Layer, 0, len(ll))
	for _, l := range ll {
		if l != nil {
			res = append(res, *l)
		} else {
			res = append(res, nil)
		}
	}
	return res
}

func (ll List) Loader() Loader {
	return LoaderFrom(ll.Deref())
}

func (ll List) Map() Map {
	m := make(Map, len(ll))
	m.Add(ll...)
	return m
}

func (ll List) Remove(lids ...ID) List {
	if ll == nil {
		return nil
	}

	res := make(List, 0, len(ll))

	for _, l := range ll {
		if l == nil {
			continue
		}
		hit := false
		for _, lid := range lids {
			if (*l).ID() == lid {
				hit = true
				break
			}
		}
		if !hit {
			res = append(res, l)
		}
	}

	return res
}

func (ll List) AddUnique(newList ...*Layer) List {
	res := make(List, 0, len(ll))

	for _, l := range ll {
		res = append(res, l)
	}

	for _, l := range newList {
		if l == nil {
			continue
		}
		if res.Find((*l).ID()) != nil {
			continue
		}
		res = append(res, l)
	}

	return res
}

type ItemList []*Item

func (ll ItemList) FindByDataset(ds DatasetID) *Item {
	for _, li := range ll {
		dsid := li.LinkedDataset()
		if dsid != nil && *dsid == ds {
			return li
		}
	}
	return nil
}

func (ll ItemList) ToLayerList() List {
	res := make(List, 0, len(ll))
	for _, l := range ll {
		var layer Layer = l
		res = append(res, &layer)
	}
	return res
}

func (ll ItemList) Last() *Item {
	if len(ll) == 0 {
		return nil
	}
	return ll[len(ll)-1]
}

type GroupList []*Group

func (ll GroupList) ToLayerList() List {
	res := make(List, 0, len(ll))
	for _, l := range ll {
		var layer Layer = l
		res = append(res, &layer)
	}
	return res
}

func (ll GroupList) Last() *Group {
	if len(ll) == 0 {
		return nil
	}
	return ll[len(ll)-1]
}

type Map map[ID]*Layer

func MapFrom(l Layer) Map {
	return List{&l}.Map()
}

func (m Map) Add(layers ...*Layer) Map {
	if m == nil {
		m = map[ID]*Layer{}
	}
	for _, l := range layers {
		if l == nil {
			continue
		}
		l2 := *l
		if l2 == nil {
			continue
		}
		m[l2.ID()] = l
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

func (m Map) Pick(il *IDList) List {
	if il == nil {
		return nil
	}

	layers := make(List, 0, il.LayerCount())
	for _, lid := range il.Layers() {
		if l := m[lid]; l != nil {
			layers = append(layers, l)
		}
	}
	return layers
}

func (m Map) Layer(i ID) Layer {
	if l := m[i]; l != nil {
		return *l
	}
	return nil
}

func (m Map) Item(i ID) *Item {
	if l := ToLayerItem(m.Layer(i)); l != nil {
		return l
	}
	return nil
}

func (m Map) Group(i ID) *Group {
	if l := ToLayerGroup(m.Layer(i)); l != nil {
		return l
	}
	return nil
}

func (m Map) Keys() []ID {
	keys := make([]ID, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sortIDs(keys)
	return keys
}

func (m Map) Len() int {
	return len(m)
}
