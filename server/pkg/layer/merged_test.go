package layer

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestMerge(t *testing.T) {
	scene := NewSceneID()
	dataset1 := NewDatasetID()
	p := MustPluginID("xxx~1.1.1")
	e := PluginExtensionID("foo")

	t1 := NewTagID()
	t2 := NewTagID()
	t3 := NewTagID()
	itemProperty := NewPropertyID()
	groupProperty := NewPropertyID()
	ib1pr := NewPropertyID()
	ib2pr := NewPropertyID()
	f1pr := NewPropertyID()
	f2pr := NewPropertyID()
	f3pr := NewPropertyID()

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
		IsVisible(false).
		MustBuild()
	// no-infobox
	itemLayer2 := NewItem().
		NewID().
		Scene(scene).
		Plugin(&p).
		Extension(&e).
		Property(&itemProperty).
		LinkedDataset(&dataset1).
		Tags(NewTagList([]Tag{NewTagGroup(t1, []*TagItem{NewTagItem(t2)}), NewTagItem(t3)})).
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
		Tags(NewTagList([]Tag{NewTagGroup(t1, []*TagItem{NewTagItem(t2)}), NewTagItem(t3)})).
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

	tests := []struct {
		name string
		o    Layer
		p    *Group
		want *Merged
	}{
		{
			name: "nil",
			o:    nil,
			p:    nil,
			want: nil,
		},
		{
			name: "parent only",
			o:    nil,
			p:    groupLayer1,
			want: nil,
		},
		{
			name: "only original without infobox and link",
			o:    itemLayer1,
			p:    nil,
			want: &Merged{
				Original:    itemLayer1.ID(),
				Parent:      nil,
				Scene:       scene,
				PluginID:    &p,
				ExtensionID: &e,
				IsVisible:   false,
				Property: &property.MergedMetadata{
					Original:      &itemProperty,
					Parent:        nil,
					LinkedDataset: nil,
				},
			},
		},
		{
			name: "only original with infobox",
			o:    itemLayer3,
			p:    nil,
			want: &Merged{
				Original:    itemLayer3.ID(),
				Parent:      nil,
				Scene:       scene,
				PluginID:    &p,
				ExtensionID: &e,
				IsVisible:   true,
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
			},
		},
		{
			name: "original without infobox, parent without infobox",
			o:    itemLayer2,
			p:    groupLayer1,
			want: &Merged{
				Original:    itemLayer2.ID(),
				Parent:      groupLayer1.IDRef(),
				Scene:       scene,
				PluginID:    &p,
				ExtensionID: &e,
				IsVisible:   true,
				Tags: []MergedTag{
					{ID: t1, Tags: []MergedTag{{ID: t2}}},
					{ID: t3},
				},
				Property: &property.MergedMetadata{
					Original:      &itemProperty,
					Parent:        &groupProperty,
					LinkedDataset: &dataset1,
				},
			},
		},
		{
			name: "original with infobox, parent without infobox",
			o:    itemLayer3,
			p:    groupLayer1,
			want: &Merged{
				Original:    itemLayer3.ID(),
				Parent:      groupLayer1.IDRef(),
				Scene:       scene,
				PluginID:    &p,
				ExtensionID: &e,
				IsVisible:   true,
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
			},
		},
		{
			name: "original without infobox, parent with infobox",
			o:    itemLayer2,
			p:    groupLayer2,
			want: &Merged{
				Original:    itemLayer2.ID(),
				Parent:      groupLayer2.IDRef(),
				Scene:       scene,
				PluginID:    &p,
				ExtensionID: &e,
				IsVisible:   true,
				Tags: []MergedTag{
					{ID: t1, Tags: []MergedTag{{ID: t2}}},
					{ID: t3},
				},
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
			},
		},
		{
			name: "original with infobox, parent with infobox",
			o:    itemLayer3,
			p:    groupLayer2,
			want: &Merged{
				Original:    itemLayer3.ID(),
				Parent:      groupLayer2.IDRef(),
				Scene:       scene,
				PluginID:    &p,
				ExtensionID: &e,
				IsVisible:   true,
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
			},
		},
		{
			name: "original with infobox but field is empty, parent with infobox",
			o:    itemLayer4,
			p:    groupLayer2,
			want: &Merged{
				Original:    itemLayer4.ID(),
				Parent:      groupLayer2.IDRef(),
				Scene:       scene,
				PluginID:    &p,
				ExtensionID: &e,
				IsVisible:   true,
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
					Fields: []*MergedInfoboxField{},
				},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// t.Parallel() // avoid data race
			actual := Merge(tt.o, tt.p)
			assert.Equal(t, tt.want, actual)
		})
	}
}

func TestMergedProperties(t *testing.T) {
	itemProperty := NewPropertyID()
	groupProperty := NewPropertyID()
	ib1pr := NewPropertyID()
	ib2pr := NewPropertyID()
	f1pr := NewPropertyID()
	f2pr := NewPropertyID()
	f3pr := NewPropertyID()

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

	assert.Equal(t, []PropertyID{
		itemProperty, groupProperty, ib1pr, ib2pr, f1pr, f2pr, f3pr,
	}, merged.Properties())
}
