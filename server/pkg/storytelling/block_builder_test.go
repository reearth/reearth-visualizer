package storytelling

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestBlockBuilder(t *testing.T) {

	b := NewBlock()
	assert.Equal(t, &BlockBuilder{block: &Block{}}, b)

	assert.PanicsWithError(t, ErrInvalidID.Error(), func() {
		b.MustBuild()
	})

	b = b.NewID()
	assert.False(t, b.block.id.IsEmpty())

	blockID := NewBlockID()
	b = b.ID(blockID)
	assert.Equal(t, blockID, b.block.id)

	pluginID, _ := id.NewPluginID("plugin", "1.0.0", nil)
	b = b.Plugin(pluginID)
	assert.Equal(t, pluginID, b.block.plugin)

	extensionId := id.PluginExtensionID("extension")
	b = b.Extension(extensionId)
	assert.Equal(t, extensionId, b.block.extension)

	propertyID := NewPropertyID()
	b = b.Property(propertyID)
	assert.Equal(t, propertyID, b.block.property)

	p, err := b.Build()
	assert.NoError(t, err)
	assert.Equal(t, &Block{
		id:        blockID,
		property:  propertyID,
		plugin:    pluginID,
		extension: extensionId,
	}, p)

	assert.NotPanics(t, func() {
		b.MustBuild()
	})
}
