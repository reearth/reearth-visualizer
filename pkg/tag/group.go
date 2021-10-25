package tag

type Group struct {
	tag
	tags *List
}

func (g *Group) Tags() *List {
	return g.tags
}
