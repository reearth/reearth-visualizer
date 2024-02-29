package layer

import (
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type List []*Layer

func ListFrom(l []Layer) []*Layer {
	return lo.ToSlicePtr(l)
}

func (ll List) Last() *Layer {
	return util.Last[Layer](ll)
}

func (ll List) IDs() *IDList {
	ids := util.ExtractIDs[ID, Layer](ll)
	if len(ids) == 0 {
		return nil
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
	return util.Pick[ID, Layer](ll, il)
}

func (ll List) Find(lid ID) *Layer {
	return util.Find[ID, Layer](ll, lid)
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
	return util.ToGenericList[Layer, Item](ll, ItemFromLayerRef)
}

func (ll List) ToLayerGroupList() GroupList {
	return util.ToGenericList[Layer, Group](ll, GroupFromLayerRef)
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
	return util.Deref[Layer](ll, false)
}

func (ll List) Loader() Loader {
	return LoaderFrom(ll.Deref())
}

func (ll List) Map() Map {
	return util.ListMap[ID, Layer](ll)
}

func (ll List) Remove(lids ...ID) List {
	return util.Remove[ID, Layer](ll, lids...)
}

func (ll List) AddUnique(newList ...*Layer) List {
	return util.AddUnique[ID, Layer](ll, newList)
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
	return util.Last[Item](ll)
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
	return util.Last[Group](ll)
}

type Map map[ID]*Layer

func MapFrom(l Layer) Map {
	return List{&l}.Map()
}

func (m Map) Add(layers ...*Layer) Map {
	return util.MapAdd[ID, Layer](m, layers...)
}

func (m Map) List() List {
	return util.MapList[ID, Layer](m, false)
}

func (m Map) Clone() Map {
	return util.Clone[ID, Layer](m)
}

func (m Map) Merge(m2 Map) Map {
	return util.Merge[ID, Layer](m, m2)
}

func (m Map) Pick(il *IDList) List {
	return util.MapPick[ID, Layer](m, il)
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
	keys := util.ExtractKeys[ID, Layer](m)
	sortIDs(keys)
	return keys
}

func (m Map) Len() int {
	return len(m)
}
