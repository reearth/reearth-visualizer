package storytelling

type BlockBuilder struct {
	block *Block
}

func NewBlock() *BlockBuilder {
	return &BlockBuilder{block: &Block{}}
}

func (b *BlockBuilder) Build() (*Block, error) {
	if b.block.id.IsNil() || string(b.block.extension) == "" || b.block.property.IsNil() || b.block.plugin.IsNil() {
		return nil, ErrInvalidID
	}
	return b.block, nil
}

func (b *BlockBuilder) MustBuild() *Block {
	i, err := b.Build()
	if err != nil {
		panic(err)
	}
	return i
}

func (b *BlockBuilder) ID(id BlockID) *BlockBuilder {
	b.block.id = id
	return b
}

func (b *BlockBuilder) NewID() *BlockBuilder {
	b.block.id = NewBlockID()
	return b
}

func (b *BlockBuilder) Plugin(plugin PluginID) *BlockBuilder {
	b.block.plugin = plugin
	return b
}

func (b *BlockBuilder) Extension(extension PluginExtensionID) *BlockBuilder {
	b.block.extension = extension
	return b
}

func (b *BlockBuilder) Property(p PropertyID) *BlockBuilder {
	b.block.property = p
	return b
}
