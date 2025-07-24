package nlslayer

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
)

type InfoboxBlockBuilder struct {
	i *InfoboxBlock
}

func NewInfoboxBlock() *InfoboxBlockBuilder {
	return &InfoboxBlockBuilder{i: &InfoboxBlock{}}
}

func (b *InfoboxBlockBuilder) Build() (*InfoboxBlock, error) {
	if b.i.id.IsNil() || b.i.property.IsNil() {
		return nil, errors.New("invalid ID InfoboxBlockBuilder ")
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

func (b *InfoboxBlockBuilder) ID(id id.InfoboxBlockID) *InfoboxBlockBuilder {
	b.i.id = id
	return b
}

func (b *InfoboxBlockBuilder) NewID() *InfoboxBlockBuilder {
	b.i.id = id.NewInfoboxBlockID()
	return b
}

func (b *InfoboxBlockBuilder) Property(p id.PropertyID) *InfoboxBlockBuilder {
	b.i.property = p
	return b
}

func (b *InfoboxBlockBuilder) Plugin(plugin id.PluginID) *InfoboxBlockBuilder {
	b.i.plugin = plugin
	return b
}

func (b *InfoboxBlockBuilder) Extension(extension id.PluginExtensionID) *InfoboxBlockBuilder {
	b.i.extension = extension
	return b
}
