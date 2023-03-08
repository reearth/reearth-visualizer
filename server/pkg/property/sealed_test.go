package property

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/stretchr/testify/assert"
)

var (
	sid    = NewSceneID()
	ds     = NewDatasetSchemaID()
	df     = NewDatasetFieldID()
	d      = NewDatasetID()
	opid   = NewID()
	ppid   = NewID()
	psid   = MustSchemaID("hoge~0.1.0/fff")
	psiid1 = SchemaGroupID("x")
	psiid2 = SchemaGroupID("y")
	i1id   = NewItemID()
	i2id   = NewItemID()
	i3id   = NewItemID()
	i4id   = NewItemID()
	i5id   = NewItemID()
)

func TestSeal(t *testing.T) {
	tests := []struct {
		Name     string
		MD       *Merged
		DSGL     dataset.GraphLoader
		Expected *Sealed
		Err      error
	}{
		{
			Name: "nil group",
		},
		{
			Name: "seal",
			MD: &Merged{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Groups: []*MergedGroup{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*MergedGroup{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
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
										Links: NewLinks([]*Link{NewLink(d, ds, df)}),
										Type:  ValueTypeString,
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*MergedField{
							{
								ID:    FieldID("a"),
								Value: ValueTypeString.ValueFrom("aaa"),
								Type:  ValueTypeString,
							},
							{
								ID:    FieldID("b"),
								Value: ValueTypeString.ValueFrom("aaa"),
								Links: NewLinks([]*Link{NewLink(d, ds, df)}),
								Type:  ValueTypeString,
							},
						},
					},
				},
			},
			DSGL: dataset.GraphLoaderFromMap(map[DatasetID]*dataset.Dataset{
				d: dataset.New().Scene(sid).ID(d).Schema(ds).Fields([]*dataset.Field{
					dataset.NewField(df, dataset.ValueTypeString.ValueFrom("bbb"), ""),
				}).MustBuild(),
			}),
			Expected: &Sealed{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Items: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*SealedItem{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
								LinkedDataset: &d,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											nil,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											dataset.ValueTypeString.ValueFrom("bbb"),
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Err: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, err := Seal(context.Background(), tc.MD, tc.DSGL)
			assert.Equal(t, tc.Expected, res)
			assert.Nil(t, err)
		})
	}
}

func TestSealProperty(t *testing.T) {
	pid := NewID()
	ps := MustSchemaID("xxx~1.1.1/aa")

	tests := []struct {
		Name     string
		Input    *Property
		Expected *Sealed
	}{
		{
			Name: "nil property",
		},
		{
			Name:  "seal property",
			Input: New().ID(pid).Scene(NewSceneID()).Schema(ps).MustBuild(),
			Expected: &Sealed{
				Original:      pid.Ref(),
				Parent:        nil,
				Schema:        ps,
				LinkedDataset: nil,
				Items:         []*SealedItem{},
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := SealProperty(context.Background(), tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestSealedItemFrom(t *testing.T) {

	tests := []struct {
		Name     string
		MG       *MergedGroup
		DSGL     dataset.GraphLoader
		Expected *SealedItem
		Err      error
	}{
		{
			Name: "nil group",
		},
		{
			Name: "groups != nil",
			MG: &MergedGroup{
				SchemaGroup:   psiid1,
				Original:      &i1id,
				Parent:        &i2id,
				LinkedDataset: &d,
				Groups: []*MergedGroup{
					{
						SchemaGroup:   psiid1,
						Original:      &i5id,
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
								Links: NewLinks([]*Link{NewLink(d, ds, df)}),
								Type:  ValueTypeString,
							},
						},
					},
				},
			},
			DSGL: dataset.GraphLoaderFromMap(map[DatasetID]*dataset.Dataset{
				d: dataset.New().Scene(sid).ID(d).Schema(ds).Fields([]*dataset.Field{
					dataset.NewField(df, dataset.ValueTypeString.ValueFrom("bbb"), ""),
				}).MustBuild(),
			}),
			Expected: &SealedItem{
				SchemaGroup:   psiid1,
				Original:      &i1id,
				Parent:        &i2id,
				LinkedDataset: &d,
				Groups: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i5id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("a"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("b"),
								),
							},
						},
					},
				},
			},
			Err: nil,
		},
		{
			Name: "groups == nil",
			MG: &MergedGroup{
				SchemaGroup:   psiid1,
				Original:      &i1id,
				Parent:        &i2id,
				LinkedDataset: &d,
				Groups: []*MergedGroup{
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*MergedField{
							{
								ID:    FieldID("a"),
								Value: ValueTypeString.ValueFrom("aaa"),
								Type:  ValueTypeString,
							},
							{
								ID:    FieldID("b"),
								Value: ValueTypeString.ValueFrom("aaa"),
								Links: NewLinks([]*Link{NewLink(d, ds, df)}),
								Type:  ValueTypeString,
							},
						},
					},
				},
			},
			DSGL: dataset.GraphLoaderFromMap(map[DatasetID]*dataset.Dataset{
				d: dataset.New().Scene(sid).ID(d).Schema(ds).Fields([]*dataset.Field{
					dataset.NewField(df, dataset.ValueTypeString.ValueFrom("bbb"), ""),
				}).MustBuild(),
			}),
			Expected: &SealedItem{
				SchemaGroup:   psiid1,
				Original:      &i1id,
				Parent:        &i2id,
				LinkedDataset: &d,
				Groups: []*SealedItem{
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Err: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, err := sealedItemFrom(context.Background(), tc.MG, tc.DSGL)
			assert.Equal(t, tc.Expected, res)
			assert.Nil(t, err)
		})
	}
}

func TestSealed_Interface(t *testing.T) {

	tests := []struct {
		Name     string
		S        *Sealed
		Expected map[string]interface{}
	}{
		{
			Name: "nil sealed",
		},
		{
			Name: "get sealed interface",
			S: &Sealed{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Items: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*SealedItem{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
								LinkedDataset: &d,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											nil,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											dataset.ValueTypeString.ValueFrom("bbb"),
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Expected: map[string]interface{}{
				"x": []map[string]interface{}{
					{
						"a":  "a",
						"b":  "b",
						"id": i5id.String(),
					},
				},
				"y": map[string]interface{}{
					"a": "aaa",
					"b": "aaa",
				},
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.S.Interface()
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestSealedItem_Match(t *testing.T) {
	tests := []struct {
		Name     string
		SI       *SealedItem
		Input    ItemID
		Expected bool
	}{
		{
			Name: "nil sealed",
		},
		{
			Name: "",
			SI: &SealedItem{
				SchemaGroup:   psiid1,
				Original:      &i1id,
				Parent:        &i2id,
				LinkedDataset: &d,
				Groups: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i5id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("a"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("b"),
								),
							},
						},
					},
				},
			},
			Input:    i2id,
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.SI.Match(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestSealed_ItemBy(t *testing.T) {

	tests := []struct {
		Name     string
		S        *Sealed
		Input    *Pointer
		Expected *SealedItem
	}{
		{
			Name: "nil sealed",
		},
		{
			Name: "get group",
			S: &Sealed{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Items: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*SealedItem{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
								LinkedDataset: &d,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											nil,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											dataset.ValueTypeString.ValueFrom("bbb"),
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("b"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(psiid1.Ref(), i1id.Ref(), FieldID("a").Ref()),
			Expected: &SealedItem{
				SchemaGroup:   psiid1,
				Original:      &i1id,
				Parent:        &i2id,
				LinkedDataset: &d,
				Groups: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i5id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("a"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("b"),
								),
							},
						},
					},
				},
			},
		},
		{
			Name: "get item",
			S: &Sealed{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Items: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*SealedItem{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
								LinkedDataset: &d,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											nil,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											dataset.ValueTypeString.ValueFrom("bbb"),
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(nil, i1id.Ref(), FieldID("a").Ref()),
			Expected: &SealedItem{
				SchemaGroup:   psiid1,
				Original:      &i1id,
				Parent:        &i2id,
				LinkedDataset: &d,
				Groups: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i5id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("a"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("b"),
								),
							},
						},
					},
				},
			},
		},
		{
			Name: "nil ptr sg",
			S: &Sealed{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Items: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*SealedItem{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
								LinkedDataset: &d,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											nil,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											dataset.ValueTypeString.ValueFrom("bbb"),
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input:    NewPointer(nil, nil, FieldID("a").Ref()),
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.S.ItemBy(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestSealed_FieldBy(t *testing.T) {

	tests := []struct {
		Name     string
		S        *Sealed
		Input    *Pointer
		Expected *SealedField
	}{
		{
			Name: "nil sealed",
		},
		{
			Name: "get group",
			S: &Sealed{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Items: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*SealedItem{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
								LinkedDataset: &d,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											nil,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											dataset.ValueTypeString.ValueFrom("bbb"),
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(psiid1.Ref(), i1id.Ref(), FieldID("a").Ref()),
			Expected: &SealedField{
				ID: "a",
				Val: NewValueAndDatasetValue(
					ValueTypeString,
					nil,
					ValueTypeString.ValueFrom("aaa"),
				),
			},
		},
		{
			Name: "get item",
			S: &Sealed{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Items: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*SealedItem{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
								LinkedDataset: &d,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											nil,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											dataset.ValueTypeString.ValueFrom("b"),
											ValueTypeString.ValueFrom("bbb"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(nil, i3id.Ref(), FieldID("a").Ref()),
			Expected: &SealedField{
				ID: "a",
				Val: NewValueAndDatasetValue(
					ValueTypeString,
					nil,
					ValueTypeString.ValueFrom("aaa"),
				),
			},
		},
		{
			Name: "nil ptr sg",
			S: &Sealed{
				Original:      opid.Ref(),
				Parent:        ppid.Ref(),
				Schema:        psid,
				LinkedDataset: &d,
				Items: []*SealedItem{
					{
						SchemaGroup:   psiid1,
						Original:      &i1id,
						Parent:        &i2id,
						LinkedDataset: &d,
						Groups: []*SealedItem{
							{
								SchemaGroup:   psiid1,
								Original:      &i5id,
								LinkedDataset: &d,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											nil,
											ValueTypeString.ValueFrom("b"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											dataset.ValueTypeString.ValueFrom("bbb"),
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup:   psiid2,
						Original:      &i3id,
						Parent:        &i4id,
						LinkedDataset: &d,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									nil,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									dataset.ValueTypeString.ValueFrom("bbb"),
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(nil, nil, FieldID("a").Ref()),
			Expected: &SealedField{
				ID: "a",
				Val: NewValueAndDatasetValue(
					ValueTypeString,
					nil,
					ValueTypeString.ValueFrom("aaa"),
				),
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.S.FieldBy(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}
