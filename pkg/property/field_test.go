package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestField_ActualValue(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	dsid := id.NewDatasetID()
	dssid := id.NewDatasetSchemaID()
	dssfid := id.NewDatasetSchemaFieldID()
	l := NewLink(dsid, dssid, dssfid)
	ls := NewLinks([]*Link{l})

	testCases := []struct {
		Name     string
		Field    *Field
		DS       *dataset.Dataset
		Expected *Value
	}{
		{
			Name:     "nil links",
			Field:    NewField(p).Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).MustBuild(),
			Expected: ValueTypeString.ValueFrom("vvv"),
		},
		{
			Name:     "nil last link",
			Field:    NewField(p).Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).Link(&Links{}).MustBuild(),
			Expected: nil,
		},
		{
			Name:  "dataset value",
			Field: NewField(p).Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).Link(ls).MustBuild(),
			DS: dataset.New().
				ID(dsid).Schema(dssid).
				Fields([]*dataset.Field{
					dataset.NewField(dssfid, dataset.ValueTypeString.ValueFrom("xxx"), "")},
				).
				MustBuild(),
			Expected: ValueTypeString.ValueFrom("xxx"),
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Field.ActualValue(tc.DS)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestField_CollectDatasets(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	dsid := id.NewDatasetID()
	dssid := id.NewDatasetSchemaID()
	dssfid := id.NewDatasetSchemaFieldID()
	l := NewLink(dsid, dssid, dssfid)
	ls := NewLinks([]*Link{l})

	testCases := []struct {
		Name     string
		Field    *Field
		Expected []id.DatasetID
	}{
		{
			Name:     "list of one datasets",
			Field:    NewField(p).Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).Link(ls).MustBuild(),
			Expected: []id.DatasetID{dsid},
		},
		{
			Name:     "nil field",
			Expected: nil,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.Field.CollectDatasets()
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestField_Clone(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	l := NewLink(id.NewDatasetID(), id.NewDatasetSchemaID(), id.NewDatasetSchemaFieldID())
	ls := NewLinks([]*Link{l})
	b := NewField(p).Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).Link(ls).MustBuild()
	r := b.Clone()
	assert.Equal(t, b, r)
}

func TestField(t *testing.T) {
	did := id.NewDatasetID()
	dsid := id.NewDatasetSchemaID()
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	b := NewField(p).MustBuild()
	assert.True(t, b.IsEmpty())
	l := NewLink(did, dsid, id.NewDatasetSchemaFieldID())
	ls := NewLinks([]*Link{l})
	b.Link(ls)
	assert.True(t, b.IsDatasetLinked(dsid, did))
	b.Unlink()
	assert.False(t, b.HasLinkedField())
}

func TestField_Update(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	b := NewField(p).Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).MustBuild()
	v := ValueTypeString.ValueFrom("xxx")
	b.UpdateUnsafe(v)
	assert.Equal(t, v, b.Value())
}
