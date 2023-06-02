package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLayerIDList(t *testing.T) {
	l1 := NewID()
	l2 := NewID()
	l3 := NewID()
	l4 := NewID()
	rawLayers := []ID{l1, l3}
	layers := NewIDList(rawLayers)

	assert.NotNil(t, layers)

	// 1, 3

	assert.Equal(t, rawLayers, layers.Layers())
	assert.Equal(t, 2, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l3, layers.LayerAt(1))
	assert.True(t, layers.HasLayer(l1))
	assert.False(t, layers.HasLayer(l2))
	assert.True(t, layers.HasLayer(l3))
	assert.False(t, layers.HasLayer(l4))

	// 1, 2, 3

	layers.AddLayer(l2, 1)
	assert.Equal(t, 3, layers.LayerCount())
	assert.True(t, layers.HasLayer(l2))
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l2, layers.LayerAt(1))
	assert.Equal(t, l3, layers.LayerAt(2))

	// 1, 2, 3 (ignored)

	layers.AddLayer(l1, 2)
	assert.Equal(t, 3, layers.LayerCount())
	assert.True(t, layers.HasLayer(l2))
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l2, layers.LayerAt(1))
	assert.Equal(t, l3, layers.LayerAt(2))

	// 1, 2, 3, 4

	layers.AddLayer(l4, 10)
	assert.Equal(t, 4, layers.LayerCount())
	assert.True(t, layers.HasLayer(l4))
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l2, layers.LayerAt(1))
	assert.Equal(t, l3, layers.LayerAt(2))
	assert.Equal(t, l4, layers.LayerAt(3))

	// 3, 1, 2, 4

	layers.MoveLayer(l3, 0)
	assert.Equal(t, 4, layers.LayerCount())
	assert.Equal(t, l3, layers.LayerAt(0))
	assert.Equal(t, l1, layers.LayerAt(1))
	assert.Equal(t, l2, layers.LayerAt(2))
	assert.Equal(t, l4, layers.LayerAt(3))

	// 1, 2, 4, 3

	layers.MoveLayer(l3, 3)
	assert.Equal(t, 4, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l2, layers.LayerAt(1))
	assert.Equal(t, l4, layers.LayerAt(2))
	assert.Equal(t, l3, layers.LayerAt(3))

	// 1, 2, 3, 4

	layers.MoveLayer(l4, 4)
	assert.Equal(t, 4, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l2, layers.LayerAt(1))
	assert.Equal(t, l3, layers.LayerAt(2))
	assert.Equal(t, l4, layers.LayerAt(3))

	// 1, 2, 3, 4

	layers.MoveLayer(l4, 10)
	assert.Equal(t, 4, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l2, layers.LayerAt(1))
	assert.Equal(t, l3, layers.LayerAt(2))
	assert.Equal(t, l4, layers.LayerAt(3))

	// 1, 2, 3, 4

	layers.MoveLayer(l4, -1)
	assert.Equal(t, 4, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l2, layers.LayerAt(1))
	assert.Equal(t, l3, layers.LayerAt(2))
	assert.Equal(t, l4, layers.LayerAt(3))

	// 1, 3, 4

	c := layers.RemoveLayer(l2)
	assert.Equal(t, 3, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l3, layers.LayerAt(1))
	assert.Equal(t, l4, layers.LayerAt(2))
	assert.False(t, layers.HasLayer(l2))
	assert.Equal(t, 1, c)

	// 1, 3, 4, 2

	layers.AddOrMoveLayer(l2, 3)
	assert.Equal(t, 4, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l3, layers.LayerAt(1))
	assert.Equal(t, l4, layers.LayerAt(2))
	assert.Equal(t, l2, layers.LayerAt(3))
	assert.True(t, layers.HasLayer(l2))

	// 1, 2, 3, 4

	layers.AddOrMoveLayer(l2, 1)
	assert.Equal(t, 4, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l2, layers.LayerAt(1))
	assert.Equal(t, l3, layers.LayerAt(2))
	assert.Equal(t, l4, layers.LayerAt(3))
	assert.True(t, layers.HasLayer(l2))

	// 1, 3

	c = layers.RemoveLayer(l2, l4)
	assert.Equal(t, 2, layers.LayerCount())
	assert.Equal(t, l1, layers.LayerAt(0))
	assert.Equal(t, l3, layers.LayerAt(1))
	assert.Equal(t, 2, c)
}
