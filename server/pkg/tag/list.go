package tag

import "github.com/reearth/reearth/server/pkg/list"

type List []Tag

func DerefList(tags []*Tag) List {
	return list.Deref[Tag](tags, true)
}

func (l List) Items() (res []*Item) {
	if len(l) == 0 {
		return
	}

	res = make([]*Item, 0, len(l))
	for _, t := range l {
		if g := ItemFrom(t); g != nil {
			res = append(res, g)
		}
	}

	return res
}

func (l List) Groups() (res []*Group) {
	if len(l) == 0 {
		return
	}

	res = make([]*Group, 0, len(l))
	for _, t := range l {
		if g := GroupFrom(t); g != nil {
			res = append(res, g)
		}
	}

	return res
}

func (l List) FilterByScene(s SceneID) (res List) {
	if len(l) == 0 {
		return
	}

	res = make(List, 0, len(l))
	for _, t := range l {
		if t.Scene() == s {
			res = append(res, t)
		}
	}

	return res
}

func (l List) Roots() (res List) {
	if len(l) == 0 {
		return
	}

	groups := l.Groups()
	for _, t := range l {
		found := false
		for _, u := range groups {
			if t.ID() == u.ID() {
				continue
			}
			if u.Tags().Has(t.ID()) {
				found = true
			}
		}
		if !found {
			res = append(res, t)
		}
	}

	return res
}

func (l List) Refs() (res []*Tag) {
	if len(l) == 0 {
		return
	}

	res = make([]*Tag, 0, len(l))
	for _, t := range l {
		t := t
		res = append(res, &t)
	}

	return res
}
