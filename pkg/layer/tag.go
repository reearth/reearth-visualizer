package layer

type TagList struct {
	tags []Tag
}

type Tag interface {
	ID() TagID
	Clone() Tag
}

type TagItem struct {
	id TagID
}

type TagGroup struct {
	id       TagID
	children []*TagItem
}

func NewTagItem(t TagID) *TagItem {
	if t.IsNil() {
		return nil
	}
	return &TagItem{
		id: t,
	}
}

func (t *TagItem) ID() TagID {
	if t == nil {
		return TagID{}
	}
	return t.id
}

func TagItemFrom(t Tag) *TagItem {
	t2, _ := t.(*TagItem)
	return t2
}

func (t *TagItem) Clone() Tag {
	return t.CloneItem()
}

func (t *TagItem) CloneItem() *TagItem {
	if t == nil {
		return nil
	}
	return NewTagItem(t.id)
}

func NewTagGroup(t TagID, children []*TagItem) *TagGroup {
	if t.IsNil() {
		return nil
	}
	return &TagGroup{
		id:       t,
		children: append(children[:0:0], children...),
	}
}

func TagGroupFrom(t Tag) *TagGroup {
	t2, _ := t.(*TagGroup)
	return t2
}

func (t *TagGroup) ID() TagID {
	if t == nil {
		return TagID{}
	}
	return t.id
}

func (t *TagGroup) Children() []*TagItem {
	if t == nil {
		return nil
	}
	return append(t.children[:0:0], t.children...)
}

func (t *TagGroup) Find(ti TagID) *TagItem {
	if t == nil {
		return nil
	}
	for _, tag := range t.children {
		if tag.ID() == ti {
			return tag
		}
	}
	return nil
}

func (t *TagGroup) Add(ti *TagItem) bool {
	if t == nil || ti == nil || t.Find(ti.ID()) != nil {
		return false
	}
	t.children = append(t.children, ti)
	return true
}

func (t *TagGroup) Delete(ti TagID) (res bool) {
	if t == nil {
		return
	}
	for i := 0; i < len(t.children); i++ {
		c := t.children[i]
		if c.ID() == ti {
			t.children = append(t.children[:i], t.children[i+1:]...)
			i--
			res = true
		}
	}
	return
}

func (t *TagGroup) Clone() Tag {
	return t.CloneGroup()
}

func (t *TagGroup) CloneGroup() *TagGroup {
	if t == nil {
		return nil
	}
	return NewTagGroup(t.id, t.children)
}

func NewTagList(tags []Tag) *TagList {
	return &TagList{tags: append(tags[:0:0], tags...)}
}

func (t *TagList) Tags() []Tag {
	if t == nil {
		return nil
	}
	return append(t.tags[:0:0], t.tags...)
}

func (t *TagList) Add(ti Tag) bool {
	if t == nil || ti == nil || t.Has(ti.ID()) || TagItemFrom(ti) == nil && TagGroupFrom(ti) == nil {
		return false
	}
	t.tags = append(t.tags, ti)
	return true
}

func (t *TagList) Delete(ti TagID) (res bool) {
	if t == nil {
		return
	}
	for i := 0; i < len(t.tags); i++ {
		c := t.tags[i]
		if c.ID() == ti {
			t.tags = append(t.tags[:i], t.tags[i+1:]...)
			i--
			res = true
		} else if TagGroupFrom(c).Delete(ti) {
			res = true
		}
	}
	return
}

func (t *TagList) Has(ti TagID) bool {
	g, i := t.Find(ti)
	return g != nil || i != nil
}

func (t *TagList) Find(ti TagID) (*TagGroup, *TagItem) {
	if t == nil {
		return nil, nil
	}
	for _, t := range t.tags {
		g := TagGroupFrom(t)
		if t.ID() == ti {
			return g, TagItemFrom(t)
		}
		if i := g.Find(ti); i != nil {
			return g, i
		}
	}
	return nil, nil
}

func (t *TagList) FindItem(ti TagID) *TagItem {
	_, i := t.Find(ti)
	return i
}

func (t *TagList) FindGroup(ti TagID) *TagGroup {
	g, i := t.Find(ti)
	if i != nil {
		return nil
	}
	return g
}

func (t *TagList) RootItems() []*TagItem {
	if t == nil {
		return nil
	}
	items := make([]*TagItem, 0, len(t.tags))
	for _, t := range t.tags {
		if i := TagItemFrom(t); i != nil {
			items = append(items, i)
		}
	}
	return items
}

func (t *TagList) IsEmpty() bool {
	return t == nil || len(t.tags) == 0
}

func (t *TagList) Clone() *TagList {
	if t == nil {
		return nil
	}
	return NewTagList(t.tags)
}
