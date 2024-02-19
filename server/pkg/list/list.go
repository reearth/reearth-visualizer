package list

type Identifiable[ID comparable] interface {
	ID() ID
}

type MapType[ID comparable, T Identifiable[ID]] map[ID]*T

func Last[ID comparable, T Identifiable[ID]](slice []*T) *T {
	if len(slice) == 0 {
		return nil
	}
	return slice[len(slice)-1]
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