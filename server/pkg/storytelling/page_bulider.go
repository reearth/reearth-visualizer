package storytelling

type PageBuilder struct {
	page *Page
}

func NewPage() *PageBuilder {
	return &PageBuilder{page: &Page{}}
}

func (b *PageBuilder) Build() (*Page, error) {
	if b.page.id.IsEmpty() {
		return nil, ErrInvalidID
	}
	return b.page, nil
}

func (b *PageBuilder) MustBuild() *Page {
	s, err := b.Build()
	if err != nil {
		panic(err)
	}
	return s
}

func (b *PageBuilder) ID(id PageID) *PageBuilder {
	b.page.id = id
	return b
}

func (b *PageBuilder) NewID() *PageBuilder {
	b.page.id = NewPageID()
	return b
}

func (b *PageBuilder) Property(property PropertyID) *PageBuilder {
	b.page.property = property
	return b
}

func (b *PageBuilder) Title(title string) *PageBuilder {
	b.page.title = title
	return b
}

func (b *PageBuilder) Swipeable(swipeable bool) *PageBuilder {
	b.page.swipeable = swipeable
	return b
}

func (b *PageBuilder) Layers(layers LayerIDList) *PageBuilder {
	b.page.layers = layers.Clone()
	return b
}

func (b *PageBuilder) SwipeableLayers(swipeableLayers LayerIDList) *PageBuilder {
	b.page.swipeableLayers = swipeableLayers.Clone()
	return b
}

func (b *PageBuilder) Blocks(blocks BlockList) *PageBuilder {
	b.page.blocks = blocks.Clone()
	return b
}
