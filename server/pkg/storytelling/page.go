package storytelling

import (
	"fmt"

	"github.com/pkg/errors"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/property"
)

type Page struct {
	id          PageID
	property    PropertyID
	title       string
	swipe       bool
	layers      LayerIDList
	swipeLayers LayerIDList
	blocks      []*Block
}

func NewPage(blocks []*Block, p PropertyID) *Page {
	Page := Page{
		property: p,
		blocks:   make([]*Block, len(blocks)),
	}
	for i, b := range blocks {
		if b == nil {
			continue
		}
		Page.blocks[i] = b
	}
	return &Page
}

func (p *Page) Id() PageID {
	return p.id
}

func (p *Page) Title() string {
	return p.title
}

func (p *Page) Swipe() bool {
	return p.swipe
}

func (p *Page) Layers() LayerIDList {
	return p.layers
}

func (p *Page) HasLayer(layer LayerID) bool {
	if p == nil || p.layers == nil {
		return false
	}
	return p.layers.Has(layer)
}

func (p *Page) AddLayer(layer LayerID) {
	p.layers = p.layers.AddUniq(layer)
}

func (p *Page) RemoveLayer(layer LayerID) {
	p.layers = p.layers.Delete(layer)
}

func (p *Page) SwipeLayers() LayerIDList {
	if !p.swipe {
		return nil
	}
	return p.swipeLayers
}

func (p *Page) HasSwipeLayer(layer LayerID) bool {
	if p == nil || p.swipeLayers == nil {
		return false
	}
	return p.swipeLayers.Has(layer)
}

func (p *Page) AddSwipeLayer(layer LayerID) {
	p.swipeLayers = p.swipeLayers.AddUniq(layer)
}

func (p *Page) RemoveSwipeLayer(layer LayerID) {
	p.swipeLayers = p.swipeLayers.Delete(layer)
}

func (p *Page) Property() PropertyID {
	return p.property
}

func (p *Page) PropertyRef() *PropertyID {
	if p == nil {
		return nil
	}
	pid := p.property
	return &pid
}

func (p *Page) Blocks() []*Block {
	if p == nil {
		return nil
	}
	return append([]*Block{}, p.blocks...)
}

func (p *Page) Block(block BlockID) *Block {
	for _, b := range p.blocks {
		if b.ID() == block {
			return b
		}
	}
	return nil
}

func (p *Page) BlockAt(index int) *Block {
	if p == nil || index < 0 || len(p.blocks) <= index {
		return nil
	}
	return p.blocks[index]
}

func (p *Page) BlocksByPlugin(pid PluginID, eid *PluginExtensionID) []*Block {
	if p == nil {
		return nil
	}
	blocks := make([]*Block, 0, len(p.blocks))
	for _, b := range p.blocks {
		if b.Plugin().Equal(pid) && (eid == nil || b.Extension() == *eid) {
			blocks = append(blocks, b)
		}
	}
	return blocks
}

func (p *Page) HasBlock(id BlockID) bool {
	if p == nil {
		return false
	}
	for _, b := range p.blocks {
		if b.ID() == id {
			return true
		}
	}
	return false
}

func (p *Page) Count() int {
	return len(p.blocks)
}

func (p *Page) AddBlock(block *Block, index int) {
	l := len(p.blocks)
	if index < 0 || l <= index {
		index = l
	}

	if p.HasBlock(block.ID()) {
		return
	}
	p.blocks = append(p.blocks[:index], append([]*Block{block}, p.blocks[index:]...)...)
}

func (p *Page) MoveBlock(block BlockID, toIndex int) {
	for fromIndex, b := range p.blocks {
		if b.ID() == block {
			p.MoveBlockAt(fromIndex, toIndex)
			return
		}
	}
}

func (p *Page) MoveBlockAt(fromIndex int, toIndex int) {
	l := len(p.blocks)
	if fromIndex < 0 || l <= fromIndex {
		return
	}
	if toIndex < 0 || l <= toIndex {
		toIndex = l - 1
	}
	b := p.blocks[fromIndex]

	p.blocks = append(p.blocks[:fromIndex], p.blocks[fromIndex+1:]...)
	newSlice := make([]*Block, toIndex+1)
	copy(newSlice, p.blocks[:toIndex])
	newSlice[toIndex] = b
	p.blocks = append(newSlice, p.blocks[toIndex:]...)
}

func (p *Page) RemoveBlock(block BlockID) {
	for index, b := range p.blocks {
		if b.ID() == block {
			p.RemoveBlockAt(index)
			return
		}
	}
}

func (p *Page) RemoveBlocksByPlugin(pid PluginID, eid *PluginExtensionID) []PropertyID {
	if p == nil {
		return nil
	}

	var properties []PropertyID
	for j := 0; j < len(p.blocks); j++ {
		if p.blocks[j].plugin.Equal(pid) && (eid == nil || p.blocks[j].Extension() == *eid) {
			properties = append(properties, p.blocks[j].Property())
			p.blocks = append(p.blocks[:j], p.blocks[j+1:]...)
			j--
		}
	}
	return properties
}

func (p *Page) RemoveBlockAt(index int) {
	l := len(p.blocks)
	if index < 0 || l <= index {
		index = l
	}

	if index == l {
		p.blocks = p.blocks[:index]
	} else {
		p.blocks = append(p.blocks[:index], p.blocks[index+1:]...)
	}
}

func (p *Page) ValidateProperties(pm property.Map) error {
	if p == nil || pm == nil {
		return nil
	}

	lp := pm[p.property]
	if lp == nil {
		return errors.New("property does not exist")
	}
	if !lp.Schema().Equal(builtin.PropertySchemaIDPage) {
		return errors.New("property has a invalid schema")
	}

	for i, b := range p.blocks {
		if err := b.ValidateProperty(pm); err != nil {
			return fmt.Errorf("block[%d](%s): %w", i, b.ID(), err)
		}
	}

	return nil
}
