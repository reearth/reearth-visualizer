package list

type Identifiable[ID comparable] interface {
	ID() ID
}

type IDLister[ID comparable] interface {
	LayerCount() int
	Layers() []ID
}

type Converter[S any, T any] func(*S) *T

func Last[T any](slice []*T) *T {
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
	for _, item := range Deref[ID, T](slice) {
		ids = append(ids, item.ID())
	}
	return ids
}

func Pick[ID comparable, T Identifiable[ID]](slice []*T, idList IDLister[ID]) []*T {
	if idList == nil || idList.LayerCount() == 0 {
		return nil
	}

	layers := make([]*T, 0, idList.LayerCount())
	for _, lid := range idList.Layers() {
		if l := Find[ID, T](slice, lid); l != nil {
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
		m = map[ID]*T{}
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
	m := make(map[ID]*T, len(slice))
	Add[ID, T](m, slice...)
	return m
}

func MapWithIDFunc[ID comparable, T any](slice []*T, idFunc func(*T) ID, checkNil bool) map[ID]*T {
	if checkNil && slice == nil {
		return nil
	}
	m := make(map[ID]*T, len(slice))
	for _, item := range slice {
		if item != nil {
			id := idFunc(item)
			m[id] = item
		}
	}
	return m
}

func Merge[ID comparable, T Identifiable[ID]](m map[ID]*T, m2 map[ID]*T) map[ID]*T {
	if m == nil {
		return Clone[ID, T](m2)
	}
	m3 := Clone[ID, T](m)
	if m2 == nil {
		return m3
	}

	return Add[ID, T](m3, List[ID, T](m2, false)...)
}

func List[ID comparable, T any](m map[ID]*T, skipNil bool) []*T {
	if m == nil {
		return nil
	}
	list := make([]*T, 0, len(m))
	for _, l := range m {
		if !skipNil || l != nil {
			list = append(list, l)
		}
	}
	return list
}

func Clone[ID comparable, T any](m map[ID]*T) map[ID]*T {
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
		if Find[ID, T](res, (*l).ID()) != nil {
			continue
		}
		res = append(res, l)
	}

	return res
}

func MapPick[ID comparable, T Identifiable[ID]](m map[ID]*T, idList IDLister[ID]) []*T {
	if idList == nil || idList.LayerCount() == 0 {
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

func ToGenericList[S any, T any](list []*S, convert Converter[S, T]) []*T {
	res := make([]*T, 0, len(list))
	for _, l := range list {
		if li := convert(l); li != nil {
			res = append(res, li)
		}
	}
	return res
}

func Has[ID comparable, T any](list []*T, getId func(*T) ID, id ID) bool {
	for _, item := range list {
		if getId(item) == id {
			return true
		}
	}
	return false
}

func Get[ID comparable, T any](list []*T, getId func(*T) ID, id ID) *T {
	for _, item := range list {
		if getId(item) == id {
			return item
		}
	}
	return nil
}

func RemoveByIds[ID comparable, T any](list []*T, getId func(*T) ID, ids ...ID) []*T {
	result := make([]*T, 0, len(list))
	for _, item := range list {
		itemID := getId(item)
		if !contains(ids, itemID) {
			result = append(result, item)
		}
	}
	return result
}

func contains[ID comparable](ids []ID, id ID) bool {
	for _, i := range ids {
		if i == id {
			return true
		}
	}
	return false
}
