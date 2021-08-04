package layer

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestMerge(t *testing.T) {
	scene := id.NewSceneID()
	dataset1 := id.NewDatasetID()
	p := id.MustPluginID("xxx~1.1.1")
	e := id.PluginExtensionID("foo")

	itemProperty := id.NewPropertyID()
	groupProperty := id.NewPropertyID()
	ib1pr := id.NewPropertyID()
	ib2pr := id.NewPropertyID()
	f1pr := id.NewPropertyID()
	f2pr := id.NewPropertyID()
	f3pr := id.NewPropertyID()

	f1 := NewInfoboxField().NewID().Plugin(p).Extension(e).Property(f1pr).MustBuild()
	f2 := NewInfoboxField().NewID().Plugin(p).Extension(e).Property(f2pr).MustBuild()
	f3 := NewInfoboxField().NewID().Plugin(p).Extension(e).Property(f3pr).MustBuild()

	// no-infobox and no-linked
	itemLayer1 := NewItem().
		NewID().
		Scene(scene).
		Plugin(&p).
		Extension(&e).
		Property(&itemProperty).
		MustBuild()
	// no-infobox
	itemLayer2 := NewItem().
		NewID().
		Scene(scene).
		Plugin(&p).
		Extension(&e).
		Property(&itemProperty).
		LinkedDataset(&dataset1).
		MustBuild()
	// infobox
	itemLayer3 := NewItem().
		NewID().
		Scene(scene).
		Plugin(&p).
		Extension(&e).
		Property(&itemProperty).
		LinkedDataset(&dataset1).
		Infobox(NewInfobox([]*InfoboxField{f1, f3}, ib1pr)).
		MustBuild()
	// infobox but field is empty
	itemLayer4 := NewItem().
		NewID().
		Scene(scene).
		Plugin(&p).
		Extension(&e).
		Property(&itemProperty).
		LinkedDataset(&dataset1).
		Infobox(NewInfobox(nil, ib1pr)).
		MustBuild()
	// no-infobox
	groupLayer1 := NewGroup().
		NewID().
		Scene(scene).
		Plugin(&p).
		Extension(&e).
		Property(&groupProperty).
		MustBuild()
	// infobox
	groupLayer2 := NewGroup().
		NewID().
		Scene(scene).
		Plugin(&p).
		Extension(&e).
		Property(&groupProperty).
		Infobox(NewInfobox([]*InfoboxField{f2, f3}, ib2pr)).
		MustBuild()

	expected1 := &Merged{
		Original:    itemLayer1.ID(),
		Parent:      nil,
		Scene:       scene,
		PluginID:    &p,
		ExtensionID: &e,
		Property: &property.MergedMetadata{
			Original:      &itemProperty,
			Parent:        nil,
			LinkedDataset: nil,
		},
	}

	expected2 := &Merged{
		Original:    itemLayer3.ID(),
		Parent:      nil,
		Scene:       scene,
		PluginID:    &p,
		ExtensionID: &e,
		Property: &property.MergedMetadata{
			Original:      &itemProperty,
			Parent:        nil,
			LinkedDataset: &dataset1,
		},
		Infobox: &MergedInfobox{
			Property: &property.MergedMetadata{
				Original:      &ib1pr,
				Parent:        nil,
				LinkedDataset: &dataset1,
			},
			Fields: []*MergedInfoboxField{
				{
					ID:        f1.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f1pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
				{
					ID:        f3.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f3pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
			},
		},
	}

	expected3 := &Merged{
		Original:    itemLayer2.ID(),
		Parent:      groupLayer1.IDRef(),
		Scene:       scene,
		PluginID:    &p,
		ExtensionID: &e,
		Property: &property.MergedMetadata{
			Original:      &itemProperty,
			Parent:        &groupProperty,
			LinkedDataset: &dataset1,
		},
	}

	expected4 := &Merged{
		Original:    itemLayer3.ID(),
		Parent:      groupLayer1.IDRef(),
		Scene:       scene,
		PluginID:    &p,
		ExtensionID: &e,
		Property: &property.MergedMetadata{
			Original:      &itemProperty,
			Parent:        &groupProperty,
			LinkedDataset: &dataset1,
		},
		Infobox: &MergedInfobox{
			Property: &property.MergedMetadata{
				Original:      &ib1pr,
				Parent:        nil,
				LinkedDataset: &dataset1,
			},
			Fields: []*MergedInfoboxField{
				{
					ID:        f1.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f1pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
				{
					ID:        f3.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f3pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
			},
		},
	}

	expected5 := &Merged{
		Original:    itemLayer2.ID(),
		Parent:      groupLayer2.IDRef(),
		Scene:       scene,
		PluginID:    &p,
		ExtensionID: &e,
		Property: &property.MergedMetadata{
			Original:      &itemProperty,
			Parent:        &groupProperty,
			LinkedDataset: &dataset1,
		},
		Infobox: &MergedInfobox{
			Property: &property.MergedMetadata{
				Original:      nil,
				Parent:        &ib2pr,
				LinkedDataset: &dataset1,
			},
			Fields: []*MergedInfoboxField{
				{
					ID:        f2.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f2pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
				{
					ID:        f3.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f3pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
			},
		},
	}

	expected6 := &Merged{
		Original:    itemLayer3.ID(),
		Parent:      groupLayer2.IDRef(),
		Scene:       scene,
		PluginID:    &p,
		ExtensionID: &e,
		Property: &property.MergedMetadata{
			Original:      &itemProperty,
			Parent:        &groupProperty,
			LinkedDataset: &dataset1,
		},
		Infobox: &MergedInfobox{
			Property: &property.MergedMetadata{
				Original:      &ib1pr,
				Parent:        &ib2pr,
				LinkedDataset: &dataset1,
			},
			Fields: []*MergedInfoboxField{
				{
					ID:        f1.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f1pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
				{
					ID:        f3.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f3pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
			},
		},
	}

	expected7 := &Merged{
		Original:    itemLayer4.ID(),
		Parent:      groupLayer2.IDRef(),
		Scene:       scene,
		PluginID:    &p,
		ExtensionID: &e,
		Property: &property.MergedMetadata{
			Original:      &itemProperty,
			Parent:        &groupProperty,
			LinkedDataset: &dataset1,
		},
		Infobox: &MergedInfobox{
			Property: &property.MergedMetadata{
				Original:      &ib1pr,
				Parent:        &ib2pr,
				LinkedDataset: &dataset1,
			},
			Fields: []*MergedInfoboxField{
				{
					ID:        f2.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f2pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
				{
					ID:        f3.ID(),
					Plugin:    p,
					Extension: e,
					Property: &property.MergedMetadata{
						Original:      &f3pr,
						Parent:        nil,
						LinkedDataset: &dataset1,
					},
				},
			},
		},
	}

	actual := Merge(nil, nil)
	assert.Nil(t, actual)
	actual = Merge(nil, groupLayer1)
	assert.Nil(t, actual)
	actual = Merge(itemLayer1, nil)
	assert.Equal(t, expected1, actual)
	actual = Merge(itemLayer3, nil)
	assert.Equal(t, expected2, actual)
	actual = Merge(itemLayer2, groupLayer1)
	assert.Equal(t, expected3, actual)
	actual = Merge(itemLayer3, groupLayer1)
	assert.Equal(t, expected4, actual)
	actual = Merge(itemLayer2, groupLayer2)
	assert.Equal(t, expected5, actual)
	actual = Merge(itemLayer3, groupLayer2)
	assert.Equal(t, expected6, actual)
	actual = Merge(itemLayer4, groupLayer2)
	assert.Equal(t, expected7, actual)
}

func TestMergedProperties(t *testing.T) {
	itemProperty := id.NewPropertyID()
	groupProperty := id.NewPropertyID()
	ib1pr := id.NewPropertyID()
	ib2pr := id.NewPropertyID()
	f1pr := id.NewPropertyID()
	f2pr := id.NewPropertyID()
	f3pr := id.NewPropertyID()

	merged := &Merged{
		Property: &property.MergedMetadata{
			Original: &itemProperty,
			Parent:   &groupProperty,
		},
		Infobox: &MergedInfobox{
			Property: &property.MergedMetadata{
				Original: &ib1pr,
				Parent:   &ib2pr,
			},
			Fields: []*MergedInfoboxField{
				{
					Property: &property.MergedMetadata{
						Original: &f1pr,
						Parent:   &f2pr,
					},
				},
				{
					Property: &property.MergedMetadata{
						Original: &f3pr,
						Parent:   nil,
					},
				},
			},
		},
	}

	assert.Equal(t, []id.PropertyID{
		itemProperty, groupProperty, ib1pr, ib2pr, f1pr, f2pr, f3pr,
	}, merged.Properties())
}
