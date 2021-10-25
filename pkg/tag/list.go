package tag

import "github.com/reearth/reearth-backend/pkg/id"

type List struct {
	tags []id.TagID
}

func NewList() *List {
	return &List{tags: []id.TagID{}}
}

func NewListFromTags(tags []id.TagID) *List {
	return &List{tags: tags}
}

func (tl *List) Tags() []id.TagID {
	if tl == nil || tl.tags == nil {
		return nil
	}
	return append([]id.TagID{}, tl.tags...)
}

func (tl *List) Has(tid id.TagID) bool {
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

func (tl *List) Add(tags ...id.TagID) {
	if tl == nil || tl.tags == nil {
		return
	}
	tl.tags = append(tl.tags, tags...)
}

func (tl *List) Remove(tags ...id.TagID) {
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
