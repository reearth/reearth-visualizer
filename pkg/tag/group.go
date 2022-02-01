package tag

type Group struct {
	tag
	tags *IDList
}

func (g *Group) Tags() *IDList {
	if g == nil {
		return nil
	}
	return g.tags
}
