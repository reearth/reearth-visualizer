package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestMerge(t *testing.T) {
	opid := id.NewPropertyID()
	ppid := id.NewPropertyID()
	psid := id.MustPropertySchemaID("hoge~0.1.0/fff")
	psid2 := id.MustPropertySchemaID("hoge~0.1.0/aaa")
	psgid1 := id.PropertySchemaGroupID("group1")
	psgid2 := id.PropertySchemaGroupID("group2")
	psgid3 := id.PropertySchemaGroupID("group3")
	psgid4 := id.PropertySchemaGroupID("group4")
	i1id := id.NewPropertyItemID()
	i2id := id.NewPropertyItemID()
	i3id := id.NewPropertyItemID()
	i4id := id.NewPropertyItemID()
	i5id := id.NewPropertyItemID()
	i6id := id.NewPropertyItemID()
	i7id := id.NewPropertyItemID()
	i8id := id.NewPropertyItemID()

	fields1 := []*Field{
		NewField(id.PropertyFieldID("a")).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("a"))).
			MustBuild(),
		NewField(id.PropertyFieldID("b")).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("b"))).
			MustBuild(),
		NewField(id.PropertyFieldID("e")).
			Value(NewOptionalValue(ValueTypeString, nil)).
			MustBuild(),
		NewField(id.PropertyFieldID("f")).
			Value(NewOptionalValue(ValueTypeNumber, nil)).
			MustBuild(),
	}

	fields2 := []*Field{
		NewField(id.PropertyFieldID("a")).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("1"))).
			MustBuild(),
		NewField(id.PropertyFieldID("c")).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("2"))).
			MustBuild(),
		NewField(id.PropertyFieldID("d")).
			Value(NewOptionalValue(ValueTypeString, nil)).
			MustBuild(),
		NewField(id.PropertyFieldID("f")).
			Value(NewOptionalValue(ValueTypeString, nil)).
			MustBuild(),
	}

	groups1 := []*Group{
		NewGroup().ID(i7id).SchemaGroup(psgid1).Fields(fields1).MustBuild(),
	}

	groups2 := []*Group{
		NewGroup().ID(i8id).SchemaGroup(psgid1).Fields(fields2).MustBuild(),
	}

	items1 := []Item{
		NewGroupList().ID(i1id).SchemaGroup(psgid1).Groups(groups1).MustBuild(),
		NewGroup().ID(i2id).SchemaGroup(psgid2).Fields(fields1).MustBuild(),
		NewGroup().ID(i3id).SchemaGroup(psgid3).Fields(fields1).MustBuild(),
	}

	items2 := []Item{
		NewGroupList().ID(i4id).SchemaGroup(psgid1).Groups(groups2).MustBuild(),
		NewGroup().ID(i5id).SchemaGroup(psgid2).Fields(fields2).MustBuild(),
		NewGroup().ID(i6id).SchemaGroup(psgid4).Fields(fields2).MustBuild(),
	}

	sid := id.NewSceneID()
	op := New().ID(opid).Scene(sid).Schema(psid).Items(items1).MustBuild()
	pp := New().NewID().Scene(sid).Schema(psid2).MustBuild()
	pp2 := New().ID(ppid).Scene(sid).Schema(psid).Items(items2).MustBuild()

	// Merge(op, pp2)
	expected1 := &Merged{
		Original: opid.Ref(),
		Parent:   ppid.Ref(),
		Schema:   psid,
		Groups: []*MergedGroup{
			{
				Original:    &i1id,
				Parent:      &i4id,
				SchemaGroup: psgid1,
				Groups: []*MergedGroup{
					{
						Original:    &i7id,
						Parent:      nil,
						SchemaGroup: psgid1,
						Fields: []*MergedField{
							{
								ID:    id.PropertyFieldID("a"),
								Value: ValueTypeString.ValueFrom("a"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertyFieldID("b"),
								Value: ValueTypeString.ValueFrom("b"),
								Type:  ValueTypeString,
							},
							{
								ID:   id.PropertyFieldID("e"),
								Type: ValueTypeString,
							},
							{
								ID:   id.PropertyFieldID("f"),
								Type: ValueTypeNumber,
							},
						},
					},
				},
			},
			{
				Original:    &i2id,
				Parent:      &i5id,
				SchemaGroup: psgid2,
				Fields: []*MergedField{
					{
						ID:         id.PropertyFieldID("a"),
						Value:      ValueTypeString.ValueFrom("a"),
						Type:       ValueTypeString,
						Overridden: true,
					},
					{
						ID:    id.PropertyFieldID("b"),
						Value: ValueTypeString.ValueFrom("b"),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("e"),
						Type: ValueTypeString,
					},
					{
						ID:    id.PropertyFieldID("c"),
						Value: ValueTypeString.ValueFrom("2"),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("d"),
						Type: ValueTypeString,
					},
				},
			},
			{
				Original:    &i3id,
				Parent:      nil,
				SchemaGroup: psgid3,
				Fields: []*MergedField{
					{
						ID:    id.PropertyFieldID("a"),
						Value: ValueTypeString.ValueFrom("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertyFieldID("b"),
						Value: ValueTypeString.ValueFrom("b"),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("e"),
						Type: ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("f"),
						Type: ValueTypeNumber,
					},
				},
			},
			{
				Original:    nil,
				Parent:      &i6id,
				SchemaGroup: psgid4,
				Fields: []*MergedField{
					{
						ID:    id.PropertyFieldID("a"),
						Value: ValueTypeString.ValueFrom("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertyFieldID("c"),
						Value: ValueTypeString.ValueFrom("2"),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("d"),
						Type: ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("f"),
						Type: ValueTypeString,
					},
				},
			},
		},
	}

	// Merge(op, nil)
	expected2 := &Merged{
		Original: opid.Ref(),
		Parent:   nil,
		Schema:   psid,
		Groups: []*MergedGroup{
			{
				Original:    &i1id,
				Parent:      nil,
				SchemaGroup: psgid1,
				Groups: []*MergedGroup{
					{
						Original:    &i7id,
						Parent:      nil,
						SchemaGroup: psgid1,
						Fields: []*MergedField{
							{
								ID:    id.PropertyFieldID("a"),
								Value: ValueTypeString.ValueFrom("a"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertyFieldID("b"),
								Value: ValueTypeString.ValueFrom("b"),
								Type:  ValueTypeString,
							},
							{
								ID:   id.PropertyFieldID("e"),
								Type: ValueTypeString,
							},
							{
								ID:   id.PropertyFieldID("f"),
								Type: ValueTypeNumber,
							},
						},
					},
				},
			},
			{
				Original:    &i2id,
				Parent:      nil,
				SchemaGroup: psgid2,
				Fields: []*MergedField{
					{
						ID:    id.PropertyFieldID("a"),
						Value: ValueTypeString.ValueFrom("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertyFieldID("b"),
						Value: ValueTypeString.ValueFrom("b"),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("e"),
						Type: ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("f"),
						Type: ValueTypeNumber,
					},
				},
			},
			{
				Original:    &i3id,
				Parent:      nil,
				SchemaGroup: psgid3,
				Fields: []*MergedField{
					{
						ID:    id.PropertyFieldID("a"),
						Value: ValueTypeString.ValueFrom("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertyFieldID("b"),
						Value: ValueTypeString.ValueFrom("b"),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("e"),
						Type: ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("f"),
						Type: ValueTypeNumber,
					},
				},
			},
		},
	}

	// Merge(nil, pp2)
	expected3 := &Merged{
		Original: nil,
		Parent:   ppid.Ref(),
		Schema:   psid,
		Groups: []*MergedGroup{
			{
				Original:    nil,
				Parent:      &i4id,
				SchemaGroup: psgid1,
				Groups: []*MergedGroup{
					{
						Original:    nil,
						Parent:      &i8id,
						SchemaGroup: psgid1,
						Fields: []*MergedField{
							{
								ID:    id.PropertyFieldID("a"),
								Value: ValueTypeString.ValueFrom("1"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertyFieldID("c"),
								Value: ValueTypeString.ValueFrom("2"),
								Type:  ValueTypeString,
							},
							{
								ID:   id.PropertyFieldID("d"),
								Type: ValueTypeString,
							},
							{
								ID:   id.PropertyFieldID("f"),
								Type: ValueTypeString,
							},
						},
					},
				},
			},
			{
				Original:    nil,
				Parent:      &i5id,
				SchemaGroup: psgid2,
				Fields: []*MergedField{
					{
						ID:    id.PropertyFieldID("a"),
						Value: ValueTypeString.ValueFrom("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertyFieldID("c"),
						Value: ValueTypeString.ValueFrom("2"),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("d"),
						Type: ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("f"),
						Type: ValueTypeString,
					},
				},
			},
			{
				Original:    nil,
				Parent:      &i6id,
				SchemaGroup: psgid4,
				Fields: []*MergedField{
					{
						ID:    id.PropertyFieldID("a"),
						Value: ValueTypeString.ValueFrom("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertyFieldID("c"),
						Value: ValueTypeString.ValueFrom("2"),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("d"),
						Type: ValueTypeString,
					},
					{
						ID:   id.PropertyFieldID("f"),
						Type: ValueTypeString,
					},
				},
			},
		},
	}

	merged0 := Merge(nil, nil)
	assert.Nil(t, merged0)
	merged1 := Merge(op, pp)
	assert.Nil(t, merged1)
	merged2 := Merge(op, pp2)
	assert.Equal(t, expected1, merged2)
	merged3 := Merge(op, nil)
	assert.Equal(t, expected2, merged3)
	merged4 := Merge(nil, pp2)
	assert.Equal(t, expected3, merged4)
}
