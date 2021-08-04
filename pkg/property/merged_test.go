package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"

	"github.com/stretchr/testify/assert"
)

func TestMerge(t *testing.T) {
	ds := id.NewDatasetSchemaID()
	df := id.NewDatasetSchemaFieldID()
	d := id.NewDatasetID()
	d2 := id.NewDatasetID()
	opid := id.NewPropertyID()
	ppid := id.NewPropertyID()
	psid := id.MustPropertySchemaID("hoge~0.1.0/fff")
	psid2 := id.MustPropertySchemaID("hoge~0.1.0/aaa")
	psgid1 := id.PropertySchemaFieldID("group1")
	psgid2 := id.PropertySchemaFieldID("group2")
	psgid3 := id.PropertySchemaFieldID("group3")
	psgid4 := id.PropertySchemaFieldID("group4")
	i1id := id.NewPropertyItemID()
	i2id := id.NewPropertyItemID()
	i3id := id.NewPropertyItemID()
	i4id := id.NewPropertyItemID()
	i5id := id.NewPropertyItemID()
	i6id := id.NewPropertyItemID()
	i7id := id.NewPropertyItemID()
	i8id := id.NewPropertyItemID()

	fields1 := []*Field{
		NewFieldUnsafe().FieldUnsafe(id.PropertySchemaFieldID("a")).ValueUnsafe(ValueTypeString.ValueFromUnsafe("a")).Build(),
		NewFieldUnsafe().FieldUnsafe(id.PropertySchemaFieldID("b")).ValueUnsafe(ValueTypeString.ValueFromUnsafe("b")).Build(),
		NewFieldUnsafe().FieldUnsafe(id.PropertySchemaFieldID("e")).TypeUnsafe(ValueTypeString).LinksUnsafe(NewLinks([]*Link{NewLink(d2, ds, df)})).Build(),
		NewFieldUnsafe().FieldUnsafe(id.PropertySchemaFieldID("f")).TypeUnsafe(ValueTypeNumber).Build(),
	}

	fields2 := []*Field{
		NewFieldUnsafe().FieldUnsafe(id.PropertySchemaFieldID("a")).ValueUnsafe(ValueTypeString.ValueFromUnsafe("1")).Build(),
		NewFieldUnsafe().FieldUnsafe(id.PropertySchemaFieldID("c")).ValueUnsafe(ValueTypeString.ValueFromUnsafe("2")).Build(),
		NewFieldUnsafe().FieldUnsafe(id.PropertySchemaFieldID("d")).TypeUnsafe(ValueTypeString).LinksUnsafe(NewLinks([]*Link{NewLinkFieldOnly(ds, df)})).Build(),
		NewFieldUnsafe().FieldUnsafe(id.PropertySchemaFieldID("f")).TypeUnsafe(ValueTypeString).Build(),
	}

	groups1 := []*Group{
		NewGroup().ID(i7id).Schema(psid, psgid1).Fields(fields1).MustBuild(),
	}

	groups2 := []*Group{
		NewGroup().ID(i8id).Schema(psid, psgid1).Fields(fields2).MustBuild(),
	}

	items1 := []Item{
		NewGroupList().ID(i1id).Schema(psid, psgid1).Groups(groups1).MustBuild(),
		NewGroup().ID(i2id).Schema(psid, psgid2).Fields(fields1).MustBuild(),
		NewGroup().ID(i3id).Schema(psid, psgid3).Fields(fields1).MustBuild(),
	}

	items2 := []Item{
		NewGroupList().ID(i4id).Schema(psid, psgid1).Groups(groups2).MustBuild(),
		NewGroup().ID(i5id).Schema(psid, psgid2).Fields(fields2).MustBuild(),
		NewGroup().ID(i6id).Schema(psid, psgid4).Fields(fields2).MustBuild(),
	}

	sid := id.NewSceneID()
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
								ID:    id.PropertySchemaFieldID("a"),
								Value: ValueTypeString.ValueFromUnsafe("a"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertySchemaFieldID("b"),
								Value: ValueTypeString.ValueFromUnsafe("b"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertySchemaFieldID("e"),
								Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
								Type:  ValueTypeString,
							},
							{
								ID:   id.PropertySchemaFieldID("f"),
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
						ID:         id.PropertySchemaFieldID("a"),
						Value:      ValueTypeString.ValueFromUnsafe("a"),
						Type:       ValueTypeString,
						Overridden: true,
					},
					{
						ID:    id.PropertySchemaFieldID("b"),
						Value: ValueTypeString.ValueFromUnsafe("b"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("e"),
						Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("c"),
						Value: ValueTypeString.ValueFromUnsafe("2"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("d"),
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
						ID:    id.PropertySchemaFieldID("a"),
						Value: ValueTypeString.ValueFromUnsafe("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("b"),
						Value: ValueTypeString.ValueFromUnsafe("b"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("e"),
						Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertySchemaFieldID("f"),
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
						ID:    id.PropertySchemaFieldID("a"),
						Value: ValueTypeString.ValueFromUnsafe("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("c"),
						Value: ValueTypeString.ValueFromUnsafe("2"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("d"),
						Links: NewLinks([]*Link{NewLink(d, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertySchemaFieldID("f"),
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
								ID:    id.PropertySchemaFieldID("a"),
								Value: ValueTypeString.ValueFromUnsafe("a"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertySchemaFieldID("b"),
								Value: ValueTypeString.ValueFromUnsafe("b"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertySchemaFieldID("e"),
								Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
								Type:  ValueTypeString,
							},
							{
								ID:   id.PropertySchemaFieldID("f"),
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
						ID:    id.PropertySchemaFieldID("a"),
						Value: ValueTypeString.ValueFromUnsafe("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("b"),
						Value: ValueTypeString.ValueFromUnsafe("b"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("e"),
						Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertySchemaFieldID("f"),
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
						ID:    id.PropertySchemaFieldID("a"),
						Value: ValueTypeString.ValueFromUnsafe("a"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("b"),
						Value: ValueTypeString.ValueFromUnsafe("b"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("e"),
						Links: NewLinks([]*Link{NewLink(d2, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertySchemaFieldID("f"),
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
								ID:    id.PropertySchemaFieldID("a"),
								Value: ValueTypeString.ValueFromUnsafe("1"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertySchemaFieldID("c"),
								Value: ValueTypeString.ValueFromUnsafe("2"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertySchemaFieldID("d"),
								Links: NewLinks([]*Link{NewLink(d, ds, df)}),
								Type:  ValueTypeString,
							},
							{
								ID:   id.PropertySchemaFieldID("f"),
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
						ID:    id.PropertySchemaFieldID("a"),
						Value: ValueTypeString.ValueFromUnsafe("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("c"),
						Value: ValueTypeString.ValueFromUnsafe("2"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("d"),
						Links: NewLinks([]*Link{NewLink(d, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertySchemaFieldID("f"),
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
						ID:    id.PropertySchemaFieldID("a"),
						Value: ValueTypeString.ValueFromUnsafe("1"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("c"),
						Value: ValueTypeString.ValueFromUnsafe("2"),
						Type:  ValueTypeString,
					},
					{
						ID:    id.PropertySchemaFieldID("d"),
						Links: NewLinks([]*Link{NewLink(d, ds, df)}),
						Type:  ValueTypeString,
					},
					{
						ID:   id.PropertySchemaFieldID("f"),
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
