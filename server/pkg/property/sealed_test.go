package property

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

var (
	opid   = id.NewPropertyID()
	ppid   = id.NewPropertyID()
	psid   = id.MustPropertySchemaID("hoge~0.1.0/fff")
	psiid1 = id.PropertySchemaGroupID("x")
	psiid2 = id.PropertySchemaGroupID("y")
	i1id   = id.NewPropertyItemID()
	i2id   = id.NewPropertyItemID()
	i3id   = id.NewPropertyItemID()
	i4id   = id.NewPropertyItemID()
	i5id   = id.NewPropertyItemID()
)

func TestSeal(t *testing.T) {
	tests := []struct {
		Name     string
		MD       *Merged
		Expected *Sealed
		Err      error
	}{
		{
			Name: "nil group",
		},
		{
			Name: "seal",
			MD: &Merged{
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,
				Groups: []*MergedGroup{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,
						Groups: []*MergedGroup{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,
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
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,

						Fields: []*MergedField{
							{
								ID:    id.PropertyFieldID("a"),
								Value: ValueTypeString.ValueFrom("aaa"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertyFieldID("b"),
								Value: ValueTypeString.ValueFrom("aaa"),
								Type:  ValueTypeString,
							},
						},
					},
				},
			},
			Expected: &Sealed{
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,

				Items: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,

						Groups: []*SealedItem{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,

								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,

						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
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
			res, err := Seal(context.Background(), tc.MD)
			assert.Equal(t, tc.Expected, res)
			assert.Nil(t, err)
		})
	}
}

func TestSealProperty(t *testing.T) {
	pid := id.NewPropertyID()
	ps := id.MustPropertySchemaID("xxx~1.1.1/aa")

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
			Input: New().ID(pid).Scene(id.NewSceneID()).Schema(ps).MustBuild(),
			Expected: &Sealed{
				Original: pid.Ref(),
				Parent:   nil,
				Schema:   ps,
				Items:    []*SealedItem{},
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
		Expected *SealedItem
		Err      error
	}{
		{
			Name: "nil group",
		},
		{
			Name: "groups != nil",
			MG: &MergedGroup{
				SchemaGroup: psiid1,
				Original:    &i1id,
				Parent:      &i2id,

				Groups: []*MergedGroup{
					{
						SchemaGroup: psiid1,
						Original:    &i5id,

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
						},
					},
				},
			},
			Expected: &SealedItem{
				SchemaGroup: psiid1,
				Original:    &i1id,
				Parent:      &i2id,
				Groups: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i5id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("a"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
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
				SchemaGroup: psiid1,
				Original:    &i1id,
				Parent:      &i2id,
				Groups: []*MergedGroup{
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,
						Fields: []*MergedField{
							{
								ID:    id.PropertyFieldID("a"),
								Value: ValueTypeString.ValueFrom("aaa"),
								Type:  ValueTypeString,
							},
							{
								ID:    id.PropertyFieldID("b"),
								Value: ValueTypeString.ValueFrom("aaa"),
								Type:  ValueTypeString,
							},
						},
					},
				},
			},
			Expected: &SealedItem{
				SchemaGroup: psiid1,
				Original:    &i1id,
				Parent:      &i2id,
				Groups: []*SealedItem{
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
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
			res, err := sealedItemFrom(context.Background(), tc.MG)
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
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,
				Items: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,
						Groups: []*SealedItem{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,

						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
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
			res := tc.S.Interface(false)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestSealedItem_Match(t *testing.T) {
	tests := []struct {
		Name     string
		SI       *SealedItem
		Input    id.PropertyItemID
		Expected bool
	}{
		{
			Name: "nil sealed",
		},
		{
			Name: "",
			SI: &SealedItem{
				SchemaGroup: psiid1,
				Original:    &i1id,
				Parent:      &i2id,
				Groups: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i5id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("a"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
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
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,
				Items: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,
						Groups: []*SealedItem{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("b"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(psiid1.Ref(), i1id.Ref(), id.PropertyFieldID("a").Ref()),
			Expected: &SealedItem{
				SchemaGroup: psiid1,
				Original:    &i1id,
				Parent:      &i2id,
				Groups: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i5id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("a"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
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
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,
				Items: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,
						Groups: []*SealedItem{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(nil, i1id.Ref(), id.PropertyFieldID("a").Ref()),
			Expected: &SealedItem{
				SchemaGroup: psiid1,
				Original:    &i1id,
				Parent:      &i2id,
				Groups: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i5id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("a"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
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
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,
				Items: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,
						Groups: []*SealedItem{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input:    NewPointer(nil, nil, id.PropertyFieldID("a").Ref()),
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
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,
				Items: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,
						Groups: []*SealedItem{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(psiid1.Ref(), i1id.Ref(), id.PropertyFieldID("a").Ref()),
			Expected: &SealedField{
				ID: "a",
				Val: NewValueAndDatasetValue(
					ValueTypeString,
					ValueTypeString.ValueFrom("aaa"),
				),
			},
		},
		{
			Name: "get item",
			S: &Sealed{
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,
				Items: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,
						Groups: []*SealedItem{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("a"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("bbb"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(nil, i3id.Ref(), id.PropertyFieldID("a").Ref()),
			Expected: &SealedField{
				ID: "a",
				Val: NewValueAndDatasetValue(
					ValueTypeString,
					ValueTypeString.ValueFrom("aaa"),
				),
			},
		},
		{
			Name: "nil ptr sg",
			S: &Sealed{
				Original: opid.Ref(),
				Parent:   ppid.Ref(),
				Schema:   psid,
				Items: []*SealedItem{
					{
						SchemaGroup: psiid1,
						Original:    &i1id,
						Parent:      &i2id,
						Groups: []*SealedItem{
							{
								SchemaGroup: psiid1,
								Original:    &i5id,
								Fields: []*SealedField{
									{
										ID: "a",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("b"),
										),
									},
									{
										ID: "b",
										Val: NewValueAndDatasetValue(
											ValueTypeString,
											ValueTypeString.ValueFrom("b"),
										),
									},
								},
							},
						},
					},
					{
						SchemaGroup: psiid2,
						Original:    &i3id,
						Parent:      &i4id,
						Fields: []*SealedField{
							{
								ID: "a",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
							{
								ID: "b",
								Val: NewValueAndDatasetValue(
									ValueTypeString,
									ValueTypeString.ValueFrom("aaa"),
								),
							},
						},
					},
				},
			},
			Input: NewPointer(nil, nil, id.PropertyFieldID("a").Ref()),
			Expected: &SealedField{
				ID: "a",
				Val: NewValueAndDatasetValue(
					ValueTypeString,
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
