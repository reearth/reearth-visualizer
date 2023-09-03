package storytelling

import (
	"fmt"

	"github.com/pkg/errors"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
)

type Page struct {
	id              PageID
	property        PropertyID
	title           string
	swipeable       bool
	layers          LayerIDList
	swipeableLayers LayerIDList
	blocks          BlockList
}

// func NewPage(blocks BlockList, p PropertyID) *Page {
// 	Page := Page{
// 		property: p,
// 		blocks:   make(BlockList, len(blocks)),
// 	}
// 	for i, b := range blocks {
// 		if b == nil {
// 			continue
// 		}
// 		Page.blocks[i] = b
// 	}
// 	return &Page
// }

func (p *Page) Id() PageID {
	return p.id
}

func (p *Page) Title() string {
	return p.title
}

func (p *Page) Swipeable() bool {
	return p.swipeable
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

func (p *Page) SwipeableLayers() LayerIDList {
	if !p.swipeable {
		return nil
	}
	return p.swipeableLayers
}

func (p *Page) HasSwipeableLayer(layer LayerID) bool {
	if p == nil || p.swipeableLayers == nil {
		return false
	}
	return p.swipeableLayers.Has(layer)
}

func (p *Page) AddSwipeableLayer(layer LayerID) {
	p.swipeableLayers = p.swipeableLayers.AddUniq(layer)
}

func (p *Page) RemoveSwipeableLayer(layer LayerID) {
	p.swipeableLayers = p.swipeableLayers.Delete(layer)
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

func (p *Page) Blocks() BlockList {
	if p == nil || p.blocks == nil {
		return nil
	}
	return append(BlockList{}, p.blocks...)
}

func (p *Page) Block(block BlockID) *Block {
	if p == nil {
		return nil
	}
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

func (p *Page) BlocksByPlugin(pid PluginID, eid *PluginExtensionID) BlockList {
	if p == nil {
		return nil
	}
	blocks := make(BlockList, 0, len(p.blocks))
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
	if p == nil {
		return 0
	}
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
	p.blocks = append(p.blocks[:index], append(BlockList{block}, p.blocks[index:]...)...)
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
	newSlice := make(BlockList, toIndex+1)
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
	if !lp.Schema().Equal(builtin.PropertySchemaIDStoryPage) {
		return errors.New("property has a invalid schema")
	}

	for i, b := range p.blocks {
		if err := b.ValidateProperty(pm); err != nil {
			return fmt.Errorf("block[%d](%s): %w", i, b.ID(), err)
		}
	}

	return nil
}

func (p *Page) SetTitle(s string) {
	if p == nil {
		return
	}
	p.title = s
}

func (p *Page) SetLayers(ids []LayerID) {
	if p == nil {
		return
	}
	p.layers = append(LayerIDList{}, ids...)
}

func (p *Page) SetSwipeable(b bool) {
	if p == nil {
		return
	}
	p.swipeable = b
}

func (p *Page) SetSwipeableLayers(ids []LayerID) {
	if p == nil {
		return
	}
	p.swipeableLayers = append(LayerIDList{}, ids...)
}

func (p *Page) Clone() *Page {
	if p == nil {
		return nil
	}
	return &Page{
		id:              p.id,
		property:        p.property.Clone(),
		title:           p.title,
		layers:          p.layers.Clone(),
		swipeable:       p.swipeable,
		swipeableLayers: p.swipeableLayers.Clone(),
		blocks:          p.blocks.Clone(),
	}
}

func (p *Page) Duplicate() *Page {
	if p == nil {
		return nil
	}
	page := p.Clone()
	page.id = NewPageID()
	page.title = fmt.Sprintf("%s (copy)", page.title)
	return page
}

func (p *Page) Properties() id.PropertyIDList {
	if p == nil {
		return nil
	}
	ids := make(id.PropertyIDList, 0, len(p.blocks)+1)
	ids = append(ids, p.property)
	for _, block := range p.blocks {
		ids = append(ids, block.Property())
	}
	return ids
}
