package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/stretchr/testify/assert"
)

func TestField_ActualValue(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	dssfid := NewDatasetFieldID()
	l := NewLink(dsid, dssid, dssfid)
	ls := NewLinks([]*Link{l})

	tests := []struct {
		Name     string
		Field    *Field
		DS       *dataset.Dataset
		Expected *Value
	}{
		{
			Name: "nil links",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
				MustBuild(),
			Expected: ValueTypeString.ValueFrom("vvv"),
		},
		{
			Name: "nil last link",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
				Links(&Links{}).
				MustBuild(),
			Expected: nil,
		},
		{
			Name: "dataset value",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
				Links(ls).
				MustBuild(),
			DS: dataset.New().
				ID(dsid).Schema(dssid).
				Fields([]*dataset.Field{
					dataset.NewField(dssfid, dataset.ValueTypeString.ValueFrom("xxx"), "")},
				).
				MustBuild(),
			Expected: ValueTypeString.ValueFrom("xxx"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Field.ActualValue(tc.DS)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestField_Datasets(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	dssfid := NewDatasetFieldID()
	l := NewLink(dsid, dssid, dssfid)
	ls := NewLinks([]*Link{l})

	tests := []struct {
		Name     string
		Field    *Field
		Expected []DatasetID
	}{
		{
			Name: "list of one datasets",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
				Links(ls).
				MustBuild(),
			Expected: []DatasetID{dsid},
		},
		{
			Name:     "nil field",
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.Field.Datasets()
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestField_Clone(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	b := FieldFrom(p).
		Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
		Links(ls).
		MustBuild()
	r := b.Clone()
	assert.Equal(t, b, r)
}

func TestField(t *testing.T) {
	did := NewDatasetID()
	dsid := NewDatasetSchemaID()
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	b := FieldFrom(p).MustBuild()
	assert.True(t, b.IsEmpty())
	l := NewLink(did, dsid, NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	b.Link(ls)
	assert.True(t, b.IsDatasetLinked(dsid, did))
	b.Unlink()
	assert.Nil(t, b.Links())
}

func TestField_Update(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	b := FieldFrom(p).
		Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
		MustBuild()
	v := ValueTypeString.ValueFrom("xxx")
	b.UpdateUnsafe(v)
	assert.Equal(t, v, b.Value())
}

func TestField_Cast(t *testing.T) {
	dgp := NewLinks([]*Link{
		NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID()),
	})

	type args struct {
		t ValueType
	}
	tests := []struct {
		name   string
		target *Field
		args   args
		want   *Field
	}{
		{
			name: "ok",
			target: &Field{
				field: FieldID("foobar"),
				v:     OptionalValueFrom(ValueTypeString.ValueFrom("-123")),
				links: dgp.Clone(),
			},
			args: args{t: ValueTypeNumber},
			want: &Field{
				field: FieldID("foobar"),
				v:     OptionalValueFrom(ValueTypeNumber.ValueFrom(-123)),
			},
		},
		{
			name: "failed",
			target: &Field{
				field: FieldID("foobar"),
				v:     OptionalValueFrom(ValueTypeString.ValueFrom("foo")),
				links: dgp.Clone(),
			},
			args: args{t: ValueTypeLatLng},
			want: &Field{
				field: FieldID("foobar"),
				v:     NewOptionalValue(ValueTypeLatLng, nil),
			},
		},
		{
			name:   "empty",
			target: &Field{},
			args:   args{t: ValueTypeNumber},
			want:   &Field{},
		},
		{
			name:   "nil",
			target: nil,
			args:   args{t: ValueTypeNumber},
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.target.Cast(tt.args.t)
			assert.Equal(t, tt.want, tt.target)
		})
	}
}
