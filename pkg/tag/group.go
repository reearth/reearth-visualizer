package tag

type Group struct {
	tag
	tags IDList
}

func (g *Group) Tags() IDList {
	if g == nil {
		return nil
	}
	return g.tags.Clone()
}

func (g *Group) RemoveTag(ids ...ID) {
	if g == nil {
		return
	}
	g.tags = g.tags.Delete(ids...)
}

func (g *Group) AddTag(ids ...ID) {
	if g == nil {
		return
	}
	g.tags = g.tags.Add(ids...)
}
