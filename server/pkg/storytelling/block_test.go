package storytelling

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestBlock_SettersGetters(t *testing.T) {

	var b *Block
	assert.True(t, b.ID().IsEmpty())
	assert.True(t, b.Property().IsEmpty())
	assert.Equal(t, PluginID{}, b.Plugin())
	assert.Equal(t, PluginExtensionID(""), b.Extension())
	assert.Nil(t, b.PropertyRef())
	assert.Nil(t, b.Clone())

	blockID := NewBlockID()
	propertyID := NewPropertyID()
	pluginID, _ := id.NewPluginID("plugin", "1.0.0", nil)
	extensionID := PluginExtensionID("extension")
	b = &Block{
		id:        blockID,
		plugin:    pluginID,
		extension: extensionID,
		property:  propertyID,
	}
	assert.Equal(t, blockID, b.ID())
	assert.Equal(t, propertyID, b.Property())
	assert.Equal(t, pluginID, b.Plugin())
	assert.Equal(t, extensionID, b.Extension())
	assert.Equal(t, propertyID.Ref(), b.PropertyRef())
	assert.NotSame(t, propertyID.Ref(), b.PropertyRef())

	newPluginID, _ := id.NewPluginID("plugin2", "1.0.1", nil)
	b.UpgradePlugin(newPluginID)
	assert.Equal(t, pluginID, b.Plugin())

	newPluginID, _ = id.NewPluginID("plugin", "1.0.1", nil)
	b.UpgradePlugin(newPluginID)
	assert.Equal(t, newPluginID, b.Plugin())

	b2 := b.Clone()

	bProperty := b.Property()
	b2Property := b2.Property()

	bPlugin := b.Plugin()
	b2Plugin := b2.Plugin()

	bExtension := b.Extension()
	b2Extension := b2.Extension()

	assert.Equal(t, b, b2)
	assert.NotSame(t, b, b2)
	assert.Equal(t, b.ID(), b2.ID())
	assert.Equal(t, bProperty, b2Property)
	assert.NotSame(t, &bProperty, &b2Property)
	assert.Equal(t, bPlugin, b2Plugin)
	assert.NotSame(t, &bPlugin, &b2Plugin)
	assert.Equal(t, bExtension, b2Extension)
	assert.NotSame(t, &bExtension, &b2Extension)
	assert.Equal(t, b.PropertyRef(), b2.PropertyRef())
	assert.NotSame(t, b.PropertyRef(), b2.PropertyRef())

}
