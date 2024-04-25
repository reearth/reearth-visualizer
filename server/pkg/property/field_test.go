package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/stretchr/testify/assert"
)

var (
	testField1 = NewField(testSchemaField1.ID()).Value(OptionalValueFrom(ValueTypeString.ValueFrom("aaa"))).MustBuild()
	testField2 = NewField(testSchemaField3.ID()).Value(NewOptionalValue(ValueTypeLatLng, nil)).MustBuild()
)

func TestField_ActualValue(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	dssfid := NewDatasetFieldID()
	ls := NewLinks([]*Link{NewLink(dsid, dssid, dssfid)})

	tests := []struct {
		Name     string
		Field    *Field
		DS       *dataset.Dataset
		Expected *ValueAndDatasetValue
	}{
		{
			Name: "nil links",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
				MustBuild(),
			Expected: NewValueAndDatasetValue(ValueTypeString, nil, ValueTypeString.ValueFrom("vvv")),
		},
		{
			Name: "empty link",
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
			Expected: NewValueAndDatasetValue(ValueTypeString, dataset.ValueTypeString.ValueFrom("xxx"), ValueTypeString.ValueFrom("vvv")),
		},
		{
			Name:     "dataset value missing",
			Field:    NewField("a").Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).Links(ls).Build(),
			DS:       dataset.New().ID(dsid).Schema(dssid).MustBuild(),
			Expected: NewValueAndDatasetValue(ValueTypeString, nil, ValueTypeString.ValueFrom("vvv")),
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
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	b := NewField("a").Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).Links(ls).Build()

	tests := []struct {
		name   string
		target *Field
		want   *Field
	}{
		{
			name:   "ok",
			target: b,
			want:   b,
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			r := b.Clone()
			assert.Equal(t, b, r)
			if tt.want != nil {
				assert.NotSame(t, b, r)
			}
		})
	}
}

func TestField_IsEmpty(t *testing.T) {
	tests := []struct {
		name   string
		target *Field
		want   bool
	}{
		{
			name:   "empty",
			target: &Field{},
			want:   true,
		},
		{
			name:   "empty value",
			target: NewField("a").Value(NewOptionalValue(ValueTypeString, nil)).Build(),
			want:   true,
		},
		{
			name:   "not empty",
			target: NewField("a").Value(OptionalValueFrom(ValueTypeString.ValueFrom("x"))).Build(),
			want:   false,
		},
		{
			name:   "nil",
			target: nil,
			want:   true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.IsEmpty())
		})
	}
}

func TestField_Link(t *testing.T) {
	did := NewDatasetID()
	dsid := NewDatasetSchemaID()
	dfid := NewDatasetFieldID()
	l := NewLinks([]*Link{NewLink(did, dsid, dfid)})

	tests := []struct {
		name   string
		target *Field
		args   *Links
	}{
		{
			name:   "link",
			target: testField1.Clone(),
			args:   l,
		},
		{
			name:   "unlink",
			target: NewField("a").Value(NewOptionalValue(ValueTypeString, nil)).Links(l).Build(),
			args:   nil,
		},
		{
			name:   "empty",
			target: &Field{},
			args:   nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.target.Link(tt.args)
			if tt.target != nil {
				assert.Equal(t, tt.args, tt.target.links)
			}
		})
	}
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
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.target.Cast(tt.args.t)
			assert.Equal(t, tt.want, tt.target)
		})
	}
}

func TestField_GuessSchema(t *testing.T) {
	tests := []struct {
		name   string
		target *Field
		want   *SchemaField
	}{
		{
			name:   "ok",
			target: &Field{field: "a", v: NewOptionalValue(ValueTypeLatLng, nil)},
			want:   &SchemaField{id: "a", propertyType: ValueTypeLatLng},
		},
		{
			name:   "empty",
			target: &Field{},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.GuessSchema())
		})
	}
}
