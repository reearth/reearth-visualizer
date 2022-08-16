package layer

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestInitializer_Clone(t *testing.T) {
	isVisible := false
	i := &Initializer{
		ID:         NewID().Ref(),
		Plugin:     MustPluginID("reearth").Ref(),
		Extension:  PluginExtensionID("marker").Ref(),
		Name:       "hoge",
		Infobox:    &InitializerInfobox{},
		PropertyID: NewPropertyID().Ref(),
		Property: &property.Initializer{
			ID: NewPropertyID().Ref(),
		},
		Layers:              []*Initializer{{}},
		IsVisible:           &isVisible,
		LinkedDatasetSchema: NewDatasetSchemaID().Ref(),
		LinkedDataset:       NewDatasetID().Ref(),
	}

	actual := i.Clone()

	assert.NotSame(t, i, actual)
	assert.NotSame(t, i.ID, actual.ID)
	assert.NotSame(t, i.Plugin, actual.Plugin)
	assert.NotSame(t, i.Extension, actual.Extension)
	assert.NotSame(t, i.Infobox, actual.Infobox)
	assert.NotSame(t, i.PropertyID, actual.PropertyID)
	assert.NotSame(t, i.Property, actual.Property)
	assert.NotSame(t, i.Layers, actual.Layers)
	assert.NotSame(t, i.Layers[0], actual.Layers[0])
	assert.NotSame(t, i.IsVisible, actual.IsVisible)
	assert.NotSame(t, i.LinkedDatasetSchema, actual.LinkedDatasetSchema)
	assert.NotSame(t, i.LinkedDataset, actual.LinkedDataset)
	assert.Equal(t, i, actual)
}

func TestInitializer_Layer(t *testing.T) {
	sid := NewSceneID()
	isVisible := false
	i := &Initializer{
		ID:        NewID().Ref(),
		Plugin:    MustPluginID("reearth").Ref(),
		Extension: PluginExtensionID("marker").Ref(),
		Name:      "hoge",
		Infobox: &InitializerInfobox{
			PropertyID: NewPropertyID().Ref(),
		},
		PropertyID:          NewPropertyID().Ref(),
		IsVisible:           &isVisible,
		LinkedDatasetSchema: NewDatasetSchemaID().Ref(),
		LinkedDataset:       NewDatasetID().Ref(),
		Layers: []*Initializer{{
			ID: NewID().Ref(),
			Layers: []*Initializer{{
				ID: NewID().Ref(),
			}},
		}},
	}

	expected1 := New().
		ID(*i.ID).
		Scene(sid).
		Plugin(i.Plugin).
		Extension(i.Extension).
		Name(i.Name).
		IsVisibleRef(i.IsVisible).
		Infobox(NewInfobox(nil, *i.Infobox.PropertyID)).
		Property(i.PropertyID).
		Group().
		Layers(NewIDList([]ID{*i.Layers[0].ID})).
		LinkedDatasetSchema(i.LinkedDatasetSchema).
		MustBuild()
	expected2 := New().ID(*i.Layers[0].ID).Scene(sid).Group().Layers(NewIDList([]ID{*i.Layers[0].Layers[0].ID})).MustBuild()
	expected3 := New().ID(*i.Layers[0].Layers[0].ID).Scene(sid).Item().MustBuild()

	actual, err := i.Layer(sid)
	assert.NoError(t, err)
	assert.Equal(t, Map{
		expected1.ID(): expected1.LayerRef(),
		expected2.ID(): expected2.LayerRef(),
		expected3.ID(): expected3.LayerRef(),
	}, actual.Layers)

	// check if a new id is generated
	i.ID = nil
	actual, err = i.Layer(sid)
	assert.NoError(t, err)
	assert.False(t, actual.RootLayer().ID().IsEmpty())
}

func TestInitializerInfobox_Clone(t *testing.T) {
	i := &InitializerInfobox{
		PropertyID: NewPropertyID().Ref(),
		Property: &property.Initializer{
			ID: NewPropertyID().Ref(),
		},
		Fields: []*InitializerInfoboxField{{
			ID:         NewInfoboxFieldID().Ref(),
			Plugin:     MustPluginID("reearth"),
			Extension:  PluginExtensionID("marker"),
			PropertyID: NewPropertyID().Ref(),
		}},
	}

	actual := i.Clone()

	assert.NotSame(t, i, actual)
	assert.NotSame(t, i.Property, actual.Property)
	assert.NotSame(t, i.Fields, actual.Fields)
	assert.NotSame(t, i.Fields[0], actual.Fields[0])
	assert.Equal(t, i, actual)
}

func TestInitializerInfobox_Infobox(t *testing.T) {
	sid := NewSceneID()
	i := &InitializerInfobox{
		PropertyID: NewPropertyID().Ref(),
		Fields: []*InitializerInfoboxField{{
			ID:         NewInfoboxFieldID().Ref(),
			Plugin:     MustPluginID("reearth"),
			Extension:  PluginExtensionID("marker"),
			PropertyID: NewPropertyID().Ref(),
		}},
	}

	expected := NewInfobox([]*InfoboxField{
		NewInfoboxField().
			ID(*i.Fields[0].ID).
			Plugin(i.Fields[0].Plugin).
			Extension(i.Fields[0].Extension).
			Property(*i.Fields[0].PropertyID).
			MustBuild(),
	}, *i.PropertyID)
	actual, _, err := i.Infobox(sid)

	assert.NoError(t, err)
	assert.Equal(t, expected, actual)
}

func TestInitializerInfoboxField_Clone(t *testing.T) {
	i := &InitializerInfoboxField{
		ID:         NewInfoboxFieldID().Ref(),
		Plugin:     MustPluginID("reearth"),
		Extension:  PluginExtensionID("marker"),
		PropertyID: NewPropertyID().Ref(),
		Property: &property.Initializer{
			ID: NewPropertyID().Ref(),
		},
	}

	actual := i.Clone()

	assert.NotSame(t, i, actual)
	assert.NotSame(t, i.Property, actual.Property)
	assert.NotSame(t, i.ID, actual.ID)
	assert.Equal(t, i, actual)
}

func TestInitializerInfoboxField_InfoboxField(t *testing.T) {
	sid := NewSceneID()
	i := &InitializerInfoboxField{
		ID:         NewInfoboxFieldID().Ref(),
		Plugin:     MustPluginID("reearth"),
		Extension:  PluginExtensionID("marker"),
		PropertyID: NewPropertyID().Ref(),
	}

	expected := NewInfoboxField().ID(*i.ID).Plugin(i.Plugin).Extension(i.Extension).Property(*i.PropertyID).MustBuild()
	actual, _, err := i.InfoboxField(sid)

	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// check if a new id is generated
	i.ID = nil
	actual, _, err = i.InfoboxField(sid)
	assert.NoError(t, err)
	assert.False(t, actual.ID().IsEmpty())
}
