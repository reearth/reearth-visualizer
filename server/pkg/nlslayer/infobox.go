package nlslayer

import (
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/property"
)

type Infobox struct {
	id       InfoboxID
	property PropertyID
	blocks   []*InfoboxBlock
	// for checking duplication
	ids map[InfoboxBlockID]struct{}
}

func NewInfobox(Blocks []*InfoboxBlock, p PropertyID) *Infobox {
	infobox := Infobox{
		id:       NewInfoboxID(),
		property: p,
		blocks:   make([]*InfoboxBlock, len(Blocks)),
		ids:      make(map[InfoboxBlockID]struct{}, len(Blocks)),
	}
	for i, f := range Blocks {
		if f == nil {
			continue
		}
		infobox.blocks[i] = f
		infobox.ids[f.ID()] = struct{}{}
	}
	return &infobox
}

func (i *Infobox) Property() PropertyID {
	return i.property
}

func (i *Infobox) PropertyRef() *PropertyID {
	if i == nil {
		return nil
	}
	pid := i.property
	return &pid
}

func (i *Infobox) Blocks() []*InfoboxBlock {
	if i == nil {
		return nil
	}
	return append([]*InfoboxBlock{}, i.blocks...)
}

func (i *Infobox) Block(Block InfoboxBlockID) *InfoboxBlock {
	for _, f := range i.blocks {
		if f.ID() == Block {
			return f
		}
	}
	return nil
}

func (i *Infobox) BlockAt(index int) *InfoboxBlock {
	if i == nil || index < 0 || len(i.blocks) <= index {
		return nil
	}
	return i.blocks[index]
}

func (i *Infobox) Has(id InfoboxBlockID) bool {
	_, ok := i.ids[id]
	return ok
}

func (i *Infobox) Count() int {
	return len(i.blocks)
}

func (i *Infobox) Add(Block *InfoboxBlock, index int) {
	l := len(i.blocks)
	if index < 0 || l <= index {
		index = l
	}

	id := Block.ID()
	if i.Has(id) {
		return
	}
	i.blocks = append(i.blocks[:index], append([]*InfoboxBlock{Block}, i.blocks[index:]...)...)
	i.ids[id] = struct{}{}
}

func (i *Infobox) Move(Block InfoboxBlockID, toIndex int) {
	for fromIndex, f := range i.blocks {
		if f.ID() == Block {
			i.MoveAt(fromIndex, toIndex)
			return
		}
	}
}

func (i *Infobox) MoveAt(fromIndex int, toIndex int) {
	l := len(i.blocks)
	if fromIndex < 0 || l <= fromIndex {
		return
	}
	if toIndex < 0 || l <= toIndex {
		toIndex = l - 1
	}
	f := i.blocks[fromIndex]

	i.blocks = append(i.blocks[:fromIndex], i.blocks[fromIndex+1:]...)
	newSlice := make([]*InfoboxBlock, toIndex+1)
	copy(newSlice, i.blocks[:toIndex])
	newSlice[toIndex] = f
	i.blocks = append(newSlice, i.blocks[toIndex:]...)
}

func (i *Infobox) Remove(Block InfoboxBlockID) {
	for index, f := range i.blocks {
		if f.ID() == Block {
			i.RemoveAt(index)
			return
		}
	}
}

func (i *Infobox) RemoveAt(index int) {
	l := len(i.blocks)
	if index < 0 || l <= index {
		index = l
	}

	f := i.blocks[index]
	if index == l {
		i.blocks = i.blocks[:index]
	} else {
		i.blocks = append(i.blocks[:index], i.blocks[index+1:]...)
	}
	delete(i.ids, f.ID())
}

func (i *Infobox) ValidateProperties(pm property.Map) error {
	if i == nil || pm == nil {
		return nil
	}

	lp := pm[i.property]
	if lp == nil {
		return errors.New("property does not exist")
	}
	if !lp.Schema().Equal(builtin.PropertySchemaIDInfobox) {
		return errors.New("property has a invalid schema")
	}

	for i, f := range i.blocks {
		if err := f.ValidateProperty(pm); err != nil {
			return fmt.Errorf("Block[%d](%s): %w", i, f.ID(), err)
		}
	}

	return nil
}

func (i *Infobox) Clone() *Infobox {
	if i == nil {
		return nil
	}

	clonedBlocks := make([]*InfoboxBlock, len(i.blocks))
	for idx, Block := range i.blocks {
		if Block != nil {
			clonedBlocks[idx] = Block.Clone()
		}
	}

	clonedIDs := make(map[InfoboxBlockID]struct{})
	for id, val := range i.ids {
		clonedIDs[id] = val
	}

	return &Infobox{
		property: i.property,
		blocks:   clonedBlocks,
		ids:      clonedIDs,
	}
}
