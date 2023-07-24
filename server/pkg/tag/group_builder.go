package tag

type GroupBuilder struct {
	g *Group
}

func NewGroup() *GroupBuilder {
	return &GroupBuilder{g: &Group{}}
}

func GroupFrom(t Tag) *Group {
	li, ok := t.(*Group)
	if !ok {
		return nil
	}
	return li
}

func (b *GroupBuilder) Build() (*Group, error) {
	if b.g.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.g.sceneId.IsNil() {
		return nil, ErrInvalidSceneID
	}
	if b.g.label == "" {
		return nil, ErrEmptyLabel
	}
	return b.g, nil
}

func (b *GroupBuilder) MustBuild() *Group {
	res, err := b.Build()
	if err != nil {
		panic(err)
	}
	return res
}

func (b *GroupBuilder) ID(tid ID) *GroupBuilder {
	b.g.id = tid
	return b
}

func (b *GroupBuilder) NewID() *GroupBuilder {
	b.g.id = NewID()
	return b
}

func (b *GroupBuilder) Label(l string) *GroupBuilder {
	b.g.label = l
	return b
}

func (b *GroupBuilder) Scene(sid SceneID) *GroupBuilder {
	b.g.sceneId = sid
	return b
}

func (b *GroupBuilder) Tags(tl IDList) *GroupBuilder {
	if len(tl) == 0 {
		b.g.tags = nil
		return b
	}
	b.g.tags = tl.Clone()
	return b
}
