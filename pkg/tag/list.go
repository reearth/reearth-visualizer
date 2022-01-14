package tag

type List struct {
	tags []ID
}

func NewList() *List {
	return &List{tags: []ID{}}
}

func NewListFromTags(tags []ID) *List {
	return &List{tags: tags}
}

func (tl *List) Tags() []ID {
	if tl == nil || tl.tags == nil {
		return nil
	}
	return append([]ID{}, tl.tags...)
}

func (tl *List) Has(tid ID) bool {
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

func (tl *List) Add(tags ...ID) {
	if tl == nil || tl.tags == nil {
		return
	}
	tl.tags = append(tl.tags, tags...)
}

func (tl *List) Remove(tags ...ID) {
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
