package storytelling

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestPage_SettersGetters(t *testing.T) {

	pageID := NewPageID()
	propertyID := NewPropertyID()
	p := &Page{
		id:              pageID,
		property:        propertyID,
		title:           "test",
		swipeable:       false,
		layers:          nil,
		swipeableLayers: nil,
		blocks:          nil,
	}

	assert.Equal(t, pageID, p.Id())
	assert.Equal(t, propertyID, p.Property())
	assert.Equal(t, "test", p.Title())
	assert.Equal(t, false, p.Swipeable())
	assert.Nil(t, p.Layers())
	assert.Nil(t, p.SwipeableLayers())
	assert.Nil(t, p.Blocks())
	assert.Equal(t, &propertyID, p.PropertyRef())
	assert.NotSame(t, &propertyID, p.PropertyRef())

	p.SetTitle("test2")
	assert.Equal(t, "test2", p.Title())

	layerID := NewLayerID()
	assert.False(t, p.HasLayer(layerID))
	p.SetLayers([]LayerID{layerID})
	assert.Equal(t, 1, len(p.Layers()))
	assert.True(t, p.HasLayer(layerID))
	p.RemoveLayer(layerID)
	assert.False(t, p.HasLayer(layerID))
	p.AddLayer(layerID)
	assert.True(t, p.HasLayer(layerID))

	p.SetSwipeable(true)
	assert.Equal(t, true, p.Swipeable())

	assert.False(t, p.HasSwipeableLayer(layerID))
	p.SetSwipeableLayers([]LayerID{layerID})
	assert.Equal(t, 1, len(p.SwipeableLayers()))
	assert.True(t, p.HasSwipeableLayer(layerID))
	p.RemoveSwipeableLayer(layerID)
	assert.False(t, p.HasSwipeableLayer(layerID))
	p.AddSwipeableLayer(layerID)
	assert.True(t, p.HasSwipeableLayer(layerID))

}

func TestPage_BlockManipulation(t *testing.T) {

	var p *Page = nil

	assert.Nil(t, p.Blocks())
	assert.Nil(t, p.Clone())
	assert.Nil(t, p.Duplicate())
	assert.Equal(t, 0, p.Count())
	assert.Nil(t, p.Block(NewBlockID()))
	assert.Nil(t, p.PropertyRef())
	assert.False(t, p.HasBlock(NewBlockID()))
	assert.Nil(t, p.BlockAt(0))
	assert.NotPanics(t, func() {
		p.SetTitle("test")
		p.SetLayers(nil)
		p.SetSwipeable(true)
		p.SetSwipeableLayers(nil)
	})
	assert.Nil(t, p.BlockAt(0))
	assert.Nil(t, p.RemoveBlocksByPlugin(id.MustPluginID("xxx~1.1.1"), nil))
	assert.Nil(t, p.BlocksByPlugin(id.MustPluginID("xxx~1.1.1"), nil))

	pageID := NewPageID()
	propertyID := NewPropertyID()
	p = &Page{
		id:              pageID,
		property:        propertyID,
		title:           "test",
		swipeable:       false,
		layers:          nil,
		swipeableLayers: nil,
		blocks:          nil,
	}

	clone := p.Clone()
	assert.Equal(t, p, clone)
	assert.NotSame(t, p, clone)

	duplicate := p.Duplicate()
	assert.NotEqual(t, p.Id(), duplicate.Id())
	assert.Equal(t, p.Title()+" (copy)", duplicate.Title())

	blockID1 := NewBlockID()
	pluginId := id.MustPluginID("xxx~1.1.1")

	assert.Nil(t, p.Blocks())
	assert.Equal(t, 0, p.Count())
	assert.Nil(t, p.Block(blockID1))
	assert.False(t, p.HasBlock(blockID1))
	assert.Nil(t, p.BlockAt(0))
	assert.Equal(t, BlockList{}, p.BlocksByPlugin(pluginId, nil))

	b1 := &Block{
		id:        blockID1,
		plugin:    pluginId,
		extension: id.PluginExtensionID("xxx"),
		property:  NewPropertyID(),
	}
	p.AddBlock(b1, 3)

	assert.Equal(t, 1, p.Count())
	assert.Equal(t, b1, p.Block(blockID1))
	assert.True(t, p.HasBlock(blockID1))
	assert.Equal(t, b1, p.BlockAt(0))
	assert.Equal(t, BlockList{b1}, p.BlocksByPlugin(pluginId, nil))

	blockID2 := NewBlockID()
	b2 := &Block{
		id:        blockID2,
		plugin:    pluginId,
		extension: id.PluginExtensionID("xxx"),
		property:  NewPropertyID(),
	}
	p.AddBlock(b2, 3)
	assert.Equal(t, 2, p.Count())
	assert.Equal(t, b2, p.Block(blockID2))
	assert.True(t, p.HasBlock(blockID2))
	assert.Equal(t, b1, p.BlockAt(0))
	assert.Equal(t, b2, p.BlockAt(1))
	assert.Equal(t, BlockList{b1, b2}, p.BlocksByPlugin(pluginId, nil))

	p.MoveBlock(blockID1, 1)
	assert.Equal(t, b2, p.BlockAt(0))
	assert.Equal(t, b1, p.BlockAt(1))

	p.MoveBlockAt(0, 1)
	assert.Equal(t, b1, p.BlockAt(0))
	assert.Equal(t, b2, p.BlockAt(1))

	p.MoveBlockAt(0, 5)
	assert.Equal(t, b2, p.BlockAt(0))
	assert.Equal(t, b1, p.BlockAt(1))

	p.MoveBlockAt(5, 0)
	assert.Equal(t, b2, p.BlockAt(0))
	assert.Equal(t, b1, p.BlockAt(1))

	p.RemoveBlock(blockID1)
	assert.Equal(t, 1, p.Count())
	assert.Equal(t, b2, p.BlockAt(0))
	assert.Equal(t, BlockList{b2}, p.BlocksByPlugin(pluginId, nil))

	p.RemoveBlockAt(0)
	assert.Equal(t, 0, p.Count())
	assert.Equal(t, BlockList{}, p.BlocksByPlugin(pluginId, nil))

	p.AddBlock(b1, 0)
	p.AddBlock(b2, 1)
	p.AddBlock(b2, 2)
	assert.Equal(t, 2, p.Count())

	p.RemoveBlockAt(5)
	assert.Equal(t, 2, p.Count())
	assert.Equal(t, b1, p.BlockAt(0))
	assert.Equal(t, b2, p.BlockAt(1))

	p.RemoveBlocksByPlugin(pluginId, nil)
	assert.Equal(t, 0, p.Count())
}
