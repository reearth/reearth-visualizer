package merging

import (
	"context"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestMergeLayer(t *testing.T) {
	// ids
	scene := id.NewSceneID()
	dataset1 := id.NewDatasetID()
	ps := id.MustPropertySchemaID("xxx~1.1.1/aa")
	p := id.MustPluginID("xxx~1.1.1")
	e := id.PluginExtensionID("foo")
	itemProperty := id.NewPropertyID()
	groupProperty := id.NewPropertyID()
	ib1pr := id.NewPropertyID()
	ib2pr := id.NewPropertyID()
	fpr := id.NewPropertyID()
	l1 := id.NewLayerID()
	l2 := id.NewLayerID()
	l1if1 := id.NewInfoboxFieldID()

	// property loader
	ploader := property.LoaderFrom([]*property.Property{
		property.New().ID(itemProperty).Scene(scene).Schema(ps).MustBuild(),
		property.New().ID(groupProperty).Scene(scene).Schema(ps).MustBuild(),
		property.New().ID(ib1pr).Scene(scene).Schema(ps).MustBuild(),
		property.New().ID(ib2pr).Scene(scene).Schema(ps).MustBuild(),
		property.New().ID(fpr).Scene(scene).Schema(ps).MustBuild(),
	})

	// layer loader
	lloader := layer.LoaderFrom([]layer.Layer{
		layer.NewItem().
			ID(l1).
			Scene(scene).
			Property(&itemProperty).
			LinkedDataset(&dataset1).
			Infobox(layer.NewInfobox(nil, ib1pr)).
			MustBuild(),
		layer.NewGroup().
			ID(l2).
			Scene(scene).
			Property(&groupProperty).
			Infobox(layer.NewInfobox([]*layer.InfoboxField{
				layer.NewInfoboxField().ID(l1if1).Plugin(p).Extension(e).Property(fpr).MustBuild(),
			}, ib2pr)).
			Layers(layer.NewIDList([]id.LayerID{l1})).
			MustBuild(),
	})

	// assert
	expectedInfoboxField := layer.MergedInfoboxField{
		ID:        l1if1,
		Plugin:    p,
		Extension: e,
		Property: &property.MergedMetadata{
			Original:      &fpr,
			LinkedDataset: &dataset1,
		},
	}
	expectedInfobox := layer.MergedInfobox{
		Property: &property.MergedMetadata{
			Original:      &ib1pr,
			Parent:        &ib2pr,
			LinkedDataset: &dataset1,
		},
		Fields: []*layer.MergedInfoboxField{&expectedInfoboxField},
	}
	expectedInfoboxField2 := layer.MergedInfoboxField{
		ID:        l1if1,
		Plugin:    p,
		Extension: e,
		Property: &property.MergedMetadata{
			Original: &fpr,
		},
	}
	expectedInfobox2 := layer.MergedInfobox{
		Property: &property.MergedMetadata{
			Original: &ib2pr,
		},
		Fields: []*layer.MergedInfoboxField{&expectedInfoboxField2},
	}

	expected := &MergedLayerGroup{
		MergedLayerCommon: MergedLayerCommon{
			Merged: layer.Merged{
				Original: l2,
				Scene:    scene,
				Property: &property.MergedMetadata{
					Original: &groupProperty,
				},
				Infobox: &expectedInfobox2,
			},
			Infobox: &MergedInfobox{
				MergedInfobox: expectedInfobox2,
				Property: &property.Merged{
					Original: &ib2pr,
					Schema:   ps,
				},
				Fields: []*MergedInfoboxField{
					{
						MergedInfoboxField: expectedInfoboxField2,
						Property: &property.Merged{
							Original: &fpr,
							Schema:   ps,
						},
					},
				},
			},
			Property: &property.Merged{
				Original: &groupProperty,
				Schema:   ps,
			},
		},
		Children: []MergedLayer{
			&MergedLayerItem{
				MergedLayerCommon{
					Merged: layer.Merged{
						Original: l1,
						Parent:   &l2,
						Scene:    scene,
						Property: &property.MergedMetadata{
							Original:      &itemProperty,
							Parent:        &groupProperty,
							LinkedDataset: &dataset1,
						},
						Infobox: &expectedInfobox,
					},
					Infobox: &MergedInfobox{
						MergedInfobox: expectedInfobox,
						Property: &property.Merged{
							Original:      &ib1pr,
							Parent:        &ib2pr,
							Schema:        ps,
							LinkedDataset: &dataset1,
						},
						Fields: []*MergedInfoboxField{
							{
								MergedInfoboxField: expectedInfoboxField,
								Property: &property.Merged{
									Original:      &fpr,
									Schema:        ps,
									LinkedDataset: &dataset1,
								},
							},
						},
					},
					Property: &property.Merged{
						Original:      &itemProperty,
						Parent:        &groupProperty,
						Schema:        ps,
						LinkedDataset: &dataset1,
					},
				},
			},
		},
	}

	merger := Merger{
		PropertyLoader: ploader,
		LayerLoader:    lloader,
	}
	actual, err := merger.MergeLayerFromID(context.Background(), l2, nil)

	assert.NoError(t, err)
	assert.Equal(t, expected, actual)
}
