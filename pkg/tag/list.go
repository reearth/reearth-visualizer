package tag

type IDList struct {
	tags []ID
}

func NewIDList() *IDList {
	return &IDList{tags: []ID{}}
}

func IDListFrom(tags []ID) *IDList {
	return &IDList{tags: tags}
}

func (tl *IDList) Tags() []ID {
	if tl == nil || len(tl.tags) == 0 {
		return nil
	}
	return append([]ID{}, tl.tags...)
}

func (tl *IDList) Has(tid ID) bool {
	if tl == nil || tl.tags == nil {
		return false
	}
	for _, tag := range tl.tags {
		if tag == tid {
			return true
		}
	}
	return false
}

func (tl *IDList) Add(tags ...ID) {
	if tl == nil || tl.tags == nil {
		return
	}
	tl.tags = append(tl.tags, tags...)
}

func (tl *IDList) Remove(tags ...ID) {
	if tl == nil || tl.tags == nil {
		return
	}
	for i := 0; i < len(tl.tags); i++ {
		for _, tid := range tags {
			if tl.tags[i] == tid {
				tl.tags = append(tl.tags[:i], tl.tags[i+1:]...)
				i--
				break
			}
		}
	}
}

type List []Tag

func DerefList(tags []*Tag) List {
	res := make(List, 0, len(tags))
	for _, t := range tags {
		if t == nil {
			continue
		}
		res = append(res, *t)
	}
	return res
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
