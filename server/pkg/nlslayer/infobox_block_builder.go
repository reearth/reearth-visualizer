package nlslayer

type InfoboxBlockBuilder struct {
	i *InfoboxBlock
}

func NewInfoboxBlock() *InfoboxBlockBuilder {
	return &InfoboxBlockBuilder{i: &InfoboxBlock{}}
}

func (b *InfoboxBlockBuilder) Build() (*InfoboxBlock, error) {
	if b.i.id.IsNil() || b.i.property.IsNil() {
		return nil, ErrInvalidID
	}
	return b.i, nil
}

func (b *InfoboxBlockBuilder) MustBuild() *InfoboxBlock {
	i, err := b.Build()
	if err != nil {
		panic(err)
	}
	return i
}

func (b *InfoboxBlockBuilder) ID(id InfoboxBlockID) *InfoboxBlockBuilder {
	b.i.id = id
	return b
}

func (b *InfoboxBlockBuilder) NewID() *InfoboxBlockBuilder {
	b.i.id = NewInfoboxBlockID()
	return b
}

func (b *InfoboxBlockBuilder) Property(p PropertyID) *InfoboxBlockBuilder {
	b.i.property = p
	return b
}

func (b *InfoboxBlockBuilder) Plugin(plugin PluginID) *InfoboxBlockBuilder {
	b.i.plugin = plugin
	return b
}

func (b *InfoboxBlockBuilder) Extension(extension PluginExtensionID) *InfoboxBlockBuilder {
	b.i.extension = extension
	return b
}
