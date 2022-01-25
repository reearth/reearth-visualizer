package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMerge(t *testing.T) {
	ds := NewDatasetSchemaID()
	df := NewDatasetFieldID()
	d := NewDatasetID()
	d2 := NewDatasetID()
	opid := NewID()
	ppid := NewID()
	psid := MustSchemaID("hoge~0.1.0/fff")
	psid2 := MustSchemaID("hoge~0.1.0/aaa")
	psgid1 := SchemaGroupID("group1")
	psgid2 := SchemaGroupID("group2")
	psgid3 := SchemaGroupID("group3")
	psgid4 := SchemaGroupID("group4")
	i1id := NewItemID()
	i2id := NewItemID()
	i3id := NewItemID()
	i4id := NewItemID()
	i5id := NewItemID()
	i6id := NewItemID()
	i7id := NewItemID()
	i8id := NewItemID()

	fields1 := []*Field{
		NewField(FieldID("a")).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("a"))).
			MustBuild(),
		NewField(FieldID("b")).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("b"))).
			MustBuild(),
		NewField(FieldID("e")).
			Value(NewOptionalValue(ValueTypeString, nil)).
			Links(NewLinks([]*Link{NewLink(d2, ds, df)})).
			MustBuild(),
		NewField(FieldID("f")).
			Value(NewOptionalValue(ValueTypeNumber, nil)).
			MustBuild(),
	}

	fields2 := []*Field{
		NewField(FieldID("a")).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("1"))).
			MustBuild(),
		NewField(FieldID("c")).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("2"))).
			MustBuild(),
		NewField(FieldID("d")).
			Value(NewOptionalValue(ValueTypeString, nil)).
			Links(NewLinks([]*Link{NewLinkFieldOnly(ds, df)})).
			MustBuild(),
		NewField(FieldID("f")).
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

	sid := NewSceneID()
	op := New().ID(opid).Scene(sid).Schema(psid).Items(items1).MustBuild()
	pp := New().NewID().Scene(sid).Schema(psid2).MustBuild()
	pp2 := New().ID(ppid).Scene(sid).Schema(psid).Items(items2).MustBuild()

	// Merge(op, pp2, &d)
	expected1 := &Merged{
		Original:      opid.Ref(),
		Parent:        ppid.Ref(),
		Schema:        psid,
		LinkedDataset: &d,
		Groups: []*MergedGroup{
			{
				Original:      &i1id,
				Parent:        &i4id,
				SchemaGroup:   psgid1,
				LinkedDataset: &d,
				Groups: []*MergedGroup{
					{
						Original:      &i7id,
						Parent:        nil,
						SchemaGroup:   psgid1,
						LinkedDataset: &d,
						Fields: []*MergedField{
							{
								ID:    FieldID("a"),
								Value: ValueTypeString.ValueFrom("a"),
								Type:  ValueTypeString,
							},
							{
								ID:    FieldID("b"),
								Value: ValueTypeString.ValueFrom("b"),
								Type:  ValueTypeString,
							},
							{
								ID:    FieldID("e"),
								Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
								Type:  ValueTypeString,
							},
							{
								ID:   FieldID("f"),
								Type: ValueTypeNumber,
							},
						},
					},
				},
			},
			{
				Original:      &i2id,
				Parent:        &i5id,
				SchemaGroup:   psgid2,
				LinkedDataset: &d,
				Fields: []*MergedField{
					{
						ID:         FieldID("a"),
						Value:      ValueTypeString.ValueFrom("a"),
						Type:       ValueTypeString,
						Overridden: true,
					},
					{
						ID:    FieldID("b"),
						Value: ValueTypeString.ValueFrom("b"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("e"),
						Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("c"),
						Value: ValueTypeString.ValueFrom("2"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("d"),
						Links: NewLinks([]*Link{NewLink(d, ds, df)}),
						Type:  ValueTypeString,
					},
				},
			},
			{
				Original:      &i3id,
				Parent:        nil,
				SchemaGroup:   psgid3,
				LinkedDataset: &d,
				Fields: []*MergedField{
					{
						ID:    FieldID("a"),
						Value: ValueTypeString.ValueFrom("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("b"),
						Value: ValueTypeString.ValueFrom("b"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("e"),
						Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   FieldID("f"),
						Type: ValueTypeNumber,
					},
				},
			},
			{
				Original:      nil,
				Parent:        &i6id,
				SchemaGroup:   psgid4,
				LinkedDataset: &d,
				Fields: []*MergedField{
					{
						ID:    FieldID("a"),
						Value: ValueTypeString.ValueFrom("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("c"),
						Value: ValueTypeString.ValueFrom("2"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("d"),
						Links: NewLinks([]*Link{NewLink(d, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   FieldID("f"),
						Type: ValueTypeString,
					},
				},
			},
		},
	}

	// Merge(op, nil, &d)
	expected2 := &Merged{
		Original:      opid.Ref(),
		Parent:        nil,
		Schema:        psid,
		LinkedDataset: &d,
		Groups: []*MergedGroup{
			{
				Original:      &i1id,
				Parent:        nil,
				SchemaGroup:   psgid1,
				LinkedDataset: &d,
				Groups: []*MergedGroup{
					{
						Original:      &i7id,
						Parent:        nil,
						SchemaGroup:   psgid1,
						LinkedDataset: &d,
						Fields: []*MergedField{
							{
								ID:    FieldID("a"),
								Value: ValueTypeString.ValueFrom("a"),
								Type:  ValueTypeString,
							},
							{
								ID:    FieldID("b"),
								Value: ValueTypeString.ValueFrom("b"),
								Type:  ValueTypeString,
							},
							{
								ID:    FieldID("e"),
								Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
								Type:  ValueTypeString,
							},
							{
								ID:   FieldID("f"),
								Type: ValueTypeNumber,
							},
						},
					},
				},
			},
			{
				Original:      &i2id,
				Parent:        nil,
				SchemaGroup:   psgid2,
				LinkedDataset: &d,
				Fields: []*MergedField{
					{
						ID:    FieldID("a"),
						Value: ValueTypeString.ValueFrom("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("b"),
						Value: ValueTypeString.ValueFrom("b"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("e"),
						Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   FieldID("f"),
						Type: ValueTypeNumber,
					},
				},
			},
			{
				Original:      &i3id,
				Parent:        nil,
				SchemaGroup:   psgid3,
				LinkedDataset: &d,
				Fields: []*MergedField{
					{
						ID:    FieldID("a"),
						Value: ValueTypeString.ValueFrom("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("b"),
						Value: ValueTypeString.ValueFrom("b"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("e"),
						Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   FieldID("f"),
						Type: ValueTypeNumber,
					},
				},
			},
		},
	}

	// Merge(nil, pp2, &d)
	expected3 := &Merged{
		Original:      nil,
		Parent:        ppid.Ref(),
		Schema:        psid,
		LinkedDataset: &d,
		Groups: []*MergedGroup{
			{
				Original:      nil,
				Parent:        &i4id,
				SchemaGroup:   psgid1,
				LinkedDataset: &d,
				Groups: []*MergedGroup{
					{
						Original:      nil,
						Parent:        &i8id,
						SchemaGroup:   psgid1,
						LinkedDataset: &d,
						Fields: []*MergedField{
							{
								ID:    FieldID("a"),
								Value: ValueTypeString.ValueFrom("1"),
								Type:  ValueTypeString,
							},
							{
								ID:    FieldID("c"),
								Value: ValueTypeString.ValueFrom("2"),
								Type:  ValueTypeString,
							},
							{
								ID:    FieldID("d"),
								Links: NewLinks([]*Link{NewLink(d, ds, df)}),
								Type:  ValueTypeString,
							},
							{
								ID:   FieldID("f"),
								Type: ValueTypeString,
							},
						},
					},
				},
			},
			{
				Original:      nil,
				Parent:        &i5id,
				SchemaGroup:   psgid2,
				LinkedDataset: &d,
				Fields: []*MergedField{
					{
						ID:    FieldID("a"),
						Value: ValueTypeString.ValueFrom("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("c"),
						Value: ValueTypeString.ValueFrom("2"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("d"),
						Links: NewLinks([]*Link{NewLink(d, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   FieldID("f"),
						Type: ValueTypeString,
					},
				},
			},
			{
				Original:      nil,
				Parent:        &i6id,
				SchemaGroup:   psgid4,
				LinkedDataset: &d,
				Fields: []*MergedField{
					{
						ID:    FieldID("a"),
						Value: ValueTypeString.ValueFrom("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("c"),
						Value: ValueTypeString.ValueFrom("2"),
						Type:  ValueTypeString,
					},
					{
						ID:    FieldID("d"),
						Links: NewLinks([]*Link{NewLink(d, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   FieldID("f"),
						Type: ValueTypeString,
					},
				},
			},
		},
	}

	merged0 := Merge(nil, nil, nil)
	assert.Nil(t, merged0)
	merged1 := Merge(op, pp, nil)
	assert.Nil(t, merged1)
	merged2 := Merge(op, pp2, &d)
	assert.Equal(t, expected1, merged2)
	merged3 := Merge(op, nil, &d)
	assert.Equal(t, expected2, merged3)
	merged4 := Merge(nil, pp2, &d)
	assert.Equal(t, expected3, merged4)
}
