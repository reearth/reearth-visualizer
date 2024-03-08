package nlslayer

import (
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type NLSLayerList []*NLSLayer

func ListFrom(l []NLSLayer) []*NLSLayer {
	return lo.ToSlicePtr(l)
}

func (ll NLSLayerList) Last() *NLSLayer {
	return util.Last[NLSLayer](ll)
}

func (ll NLSLayerList) IDs() *IDList {
	ids := util.ExtractIDs[ID, NLSLayer](ll)
	if len(ids) == 0 {
		return nil
	}
	return NewIDList(ids)
}

func (ll NLSLayerList) Pick(il *IDList) NLSLayerList {
	return util.Pick[ID, NLSLayer](ll, il)
}

func (ll NLSLayerList) Find(lid ID) *NLSLayer {
	return util.Find[ID, NLSLayer](ll, lid)
}

func (ll NLSLayerList) ToLayerItemList() NLSLayerSimpleList {
	return util.ToGenericList[NLSLayer, NLSLayerSimple](ll, NLSLayerSimpleFromLayerRef)
}

func (ll NLSLayerList) ToNLSLayerGroupList() NLSLayerGroupList {
	return util.ToGenericList[NLSLayer, NLSLayerGroup](ll, NLSLayerGroupFromLayerRef)
}

func (ll NLSLayerList) SeparateLayerItemAndGroup() (NLSLayerSimpleList, NLSLayerGroupList) {
	resi := make(NLSLayerSimpleList, 0, len(ll))
	resg := make(NLSLayerGroupList, 0, len(ll))
	for _, l := range ll {
		if lg := NLSLayerGroupFromLayerRef(l); lg != nil {
			resg = append(resg, lg)
		} else if li := NLSLayerSimpleFromLayerRef(l); li != nil {
			resi = append(resi, li)
		}
	}
	return resi, resg
}

func (ll NLSLayerList) Deref() []NLSLayer {
	return util.Deref[NLSLayer](ll, false)
}

func (ll NLSLayerList) Loader() Loader {
	return LoaderFrom(ll.Deref())
}

func (ll NLSLayerList) Map() Map {
	return util.ListMap[ID, NLSLayer](ll)
}

func (ll NLSLayerList) Remove(lids ...ID) NLSLayerList {
	return util.Remove[ID, NLSLayer](ll, lids...)
}

func (ll NLSLayerList) AddUnique(newList ...*NLSLayer) NLSLayerList {
	return util.AddUnique[ID, NLSLayer](ll, newList)
}

type NLSLayerSimpleList []*NLSLayerSimple

func (ll NLSLayerSimpleList) ToLayerList() NLSLayerList {
	res := make(NLSLayerList, 0, len(ll))
	for _, l := range ll {
		var layer NLSLayer = l
		res = append(res, &layer)
	}
	return res
}

func (ll NLSLayerSimpleList) Last() *NLSLayerSimple {
	return util.Last[NLSLayerSimple](ll)
}

type NLSLayerGroupList []*NLSLayerGroup

func (ll NLSLayerGroupList) ToLayerList() NLSLayerList {
	res := make(NLSLayerList, 0, len(ll))
	for _, l := range ll {
		var layer NLSLayer = l
		res = append(res, &layer)
	}
	return res
}

func (ll NLSLayerGroupList) Last() *NLSLayerGroup {
	return util.Last[NLSLayerGroup](ll)
}

type Map map[ID]*NLSLayer

func MapFrom(l NLSLayer) Map {
	return NLSLayerList{&l}.Map()
}

func (m Map) Add(layers ...*NLSLayer) Map {
	return util.MapAdd[ID, NLSLayer](m, layers...)
}

func (m Map) NLSLayerList() NLSLayerList {
	return util.MapList[ID, NLSLayer](m, false)
}

func (m Map) Clone() Map {
	return util.Clone[ID, NLSLayer](m)
}

func (m Map) Merge(m2 Map) Map {
	return util.Merge[ID, NLSLayer](m, m2)
}

func (m Map) Pick(il *IDList) NLSLayerList {
	return util.MapPick[ID, NLSLayer](m, il)
}

func (m Map) NLSLayer(i ID) NLSLayer {
	if l := m[i]; l != nil {
		return *l
	}
	return nil
}

func (m Map) Item(i ID) *NLSLayerSimple {
	if l := ToNLSLayerSimple(m.NLSLayer(i)); l != nil {
		return l
	}
	return nil
}

func (m Map) Group(i ID) *NLSLayerGroup {
	if l := ToNLSLayerGroup(m.NLSLayer(i)); l != nil {
		return l
	}
	return nil
}

func (m Map) Keys() []ID {
	keys := util.ExtractKeys[ID, NLSLayer](m)
	sortIDs(keys)
	return keys
}

func (m Map) Len() int {
	return len(m)
}
