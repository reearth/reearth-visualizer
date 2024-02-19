package list

import "reflect"

type Identifiable[ID comparable] interface {
	ID() ID
}

type IDLister[ID comparable] interface {
	LayerCount() int
	Layers() []ID
}

type MapType[ID comparable, T Identifiable[ID]] map[ID]*T

func Last[ID comparable, T Identifiable[ID]](slice []*T) *T {
	if len(slice) == 0 {
		return nil
	}
	return slice[len(slice)-1]
}

func ExtractIDs[ID comparable, T Identifiable[ID]](slice []*T) []ID {
	if len(slice) == 0 {
		return nil
	}
	ids := make([]ID, 0, len(slice))
	for _, item := range Deref(slice) {
		ids = append(ids, item.ID())
	}
	return ids
}

func Pick[ID comparable, T Identifiable[ID]](slice []*T, idList IDLister[ID]) []*T {
	if idList == nil || reflect.ValueOf(idList).IsNil() {
		return nil
	}

	layers := make([]*T, 0, idList.LayerCount())
	for _, lid := range idList.Layers() {
		if l := Find(slice, lid); l != nil {
			layers = append(layers, l)
		}
	}
	return layers
}

func Find[ID comparable, T Identifiable[ID]](slice []*T, lid ID) *T {
	for _, item := range slice {
		if item == nil {
			continue
		}
		if (*item).ID() == lid {
			return item
		}
	}
	return nil
}

func Deref[ID comparable, T Identifiable[ID]](slice []*T) []T {
	if slice == nil {
		return nil
	}
	res := make([]T, 0, len(slice))
	var zeroValue T
	for _, item := range slice {
		if item != nil {
			res = append(res, *item)
		} else {
			res = append(res, zeroValue)
		}
	}
	return res
}

func Add[ID comparable, T Identifiable[ID]](m map[ID]*T, items ...*T) map[ID]*T {
	if m == nil {
		return map[ID]*T{}
	}
	for _, item := range items {
		if item == nil {
			continue
		}
		m[(*item).ID()] = item
	}
	return m
}

func Map[ID comparable, T Identifiable[ID]](slice []*T) map[ID]*T {
	m := make(MapType[ID, T], len(slice))
	Add(m, slice...)
	return m
}

func Merge[ID comparable, T Identifiable[ID]](m map[ID]*T, m2 map[ID]*T) map[ID]*T {
	if m == nil {
		return Clone(m2)
	}
	m3 := Clone(m)
	if m2 == nil {
		return m3
	}

	return Add(m3, List(m2)...)
}

func List[ID comparable, T Identifiable[ID]](m map[ID]*T) []*T {
	if m == nil {
		return nil
	}
	list := make([]*T, 0, len(m))
	for _, l := range m {
		list = append(list, l)
	}
	return list
}

func Clone[ID comparable, T Identifiable[ID]](m map[ID]*T) map[ID]*T {
	if m == nil {
		return map[ID]*T{}
	}
	m2 := make(map[ID]*T, len(m))
	for k, v := range m {
		m2[k] = v
	}
	return m2
}

func Remove[ID comparable, T Identifiable[ID]](slice []*T, idsToRemove ...ID) []*T {
	if slice == nil {
		return nil
	}
	if len(slice) == 0 {
		return []*T{}
	}

	result := make([]*T, 0, len(slice))
	for _, item := range slice {
		remove := false
		for _, id := range idsToRemove {
			if (*item).ID() == id {
				remove = true
				break
			}
		}
		if !remove {
			result = append(result, item)
		}
	}
	return result
}

func AddUnique[ID comparable, T Identifiable[ID]](slice []*T, newList []*T) []*T {
	res := append([]*T{}, slice...)

	for _, l := range newList {
		if l == nil {
			continue
		}
		if Find(res, (*l).ID()) != nil {
			continue
		}
		res = append(res, l)
	}

	return res
}

func MapPick[ID comparable, T Identifiable[ID]](m map[ID]*T, idList IDLister[ID]) []*T {
	if idList == nil || reflect.ValueOf(idList).IsNil() {
		return nil
	}

	layers := make([]*T, 0, idList.LayerCount())
	for _, lid := range idList.Layers() {
		if l := m[lid]; l != nil {
			layers = append(layers, l)
		}
	}
	return layers
}

func ExtractKeys[ID comparable, T any](m map[ID]*T) []ID {
	keys := make([]ID, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
