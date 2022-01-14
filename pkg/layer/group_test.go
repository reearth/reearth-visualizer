package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var _ Layer = &Group{}

var l1 = NewID()
var l2 = NewID()
var group = Group{
	layerBase: layerBase{
		id:        NewID(),
		name:      "xxx",
		visible:   false,
		plugin:    MustPluginID("aaa~1.1.1").Ref(),
		extension: PluginExtensionID("foo").Ref(),
		property:  nil,
		infobox:   nil,
		tags:      nil,
		scene:     SceneID{},
	},
	layers: &IDList{
		layers:   append(make([]ID, 0), l1, l2),
		layerIDs: map[ID]struct{}{l1: {}, l2: {}},
	},
	linkedDatasetSchema: nil,
	root:                true,
}

func TestGroup_ID(t *testing.T) {
	assert.NotNil(t, group.ID())
	assert.IsType(t, NewID(), group.ID())
}

func TestGroup_Name(t *testing.T) {
	assert.Equal(t, "xxx", group.Name())
}

func TestGroup_Plugin(t *testing.T) {
	assert.NotNil(t, group.Plugin())
	assert.True(t, MustPluginID("aaa~1.1.1").Equal(*group.Plugin()))
}

func TestGroup_IDRef(t *testing.T) {
	assert.NotNil(t, group.IDRef())
	assert.IsType(t, NewID(), group.ID())
}

func TestGroup_Extension(t *testing.T) {
	assert.NotNil(t, group.Extension())
	assert.Equal(t, "foo", group.Extension().String())
}

func TestGroup_Infobox(t *testing.T) {
	assert.Nil(t, group.Infobox())
}

func TestGroup_IsVisible(t *testing.T) {
	assert.False(t, group.IsVisible())
}

func TestGroup_Property(t *testing.T) {
	assert.Nil(t, group.Property())
}

func TestGroup_IsLinked(t *testing.T) {
	assert.False(t, group.IsLinked())
}

func TestGroup_IsRoot(t *testing.T) {
	assert.True(t, group.IsRoot())
}

func TestGroup_Rename(t *testing.T) {
	group.Rename("fff")
	assert.Equal(t, "fff", group.Name())
}

func TestGroup_SetInfobox(t *testing.T) {
	inf := Infobox{
		property: NewPropertyID(),
		fields:   nil,
		ids:      nil,
	}
	group.SetInfobox(&inf)
	assert.NotNil(t, group.Infobox())
}

func TestGroup_SetPlugin(t *testing.T) {
	group.SetPlugin(MustPluginID("ccc~1.1.1").Ref())
	assert.NotNil(t, group.Plugin())
	assert.True(t, MustPluginID("ccc~1.1.1").Equal(*group.Plugin()))
}

func TestGroup_SetVisible(t *testing.T) {
	group.SetVisible(true)
	assert.True(t, group.IsVisible())
}

func TestGroup_Properties(t *testing.T) {
	assert.NotNil(t, group.Properties())
	assert.Equal(t, 1, len(group.Properties()))
}

func TestGroup_UsesPlugin(t *testing.T) {
	assert.True(t, group.UsesPlugin())
}

func TestGroup_LayerRef(t *testing.T) {
	assert.NotNil(t, group.LayerRef())
}

func TestGroup_Layers(t *testing.T) {
	assert.Equal(t, 2, len(group.Layers().Layers()))
}

func TestGroup_LinkedDatasetSchema(t *testing.T) {
	assert.Nil(t, group.LinkedDatasetSchema())
}

func TestGroup_Link(t *testing.T) {
	group.Link(NewDatasetSchemaID())
	assert.NotNil(t, group.LinkedDatasetSchema())
}

func TestGroup_Unlink(t *testing.T) {
	group.Unlink()
	assert.Nil(t, group.LinkedDatasetSchema())
}

func TestGroup_MoveLayerFrom(t *testing.T) {
	group.MoveLayerFrom(l1, 1, &group)
	assert.Equal(t, l1, group.Layers().Layers()[1])
}
