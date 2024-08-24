package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var (
	testField1 = NewField(testSchemaField1.ID()).Value(OptionalValueFrom(ValueTypeString.ValueFrom("aaa"))).MustBuild()
	testField2 = NewField(testSchemaField3.ID()).Value(NewOptionalValue(ValueTypeLatLng, nil)).MustBuild()
)

func TestField_ActualValue(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()

	tests := []struct {
		Name     string
		Field    *Field
		Expected *ValueAndDatasetValue
	}{
		{
			Name: "nil links",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
				MustBuild(),
			Expected: NewValueAndDatasetValue(ValueTypeString, ValueTypeString.ValueFrom("vvv")),
		},
		{
			Name: "empty link",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
				MustBuild(),
			Expected: nil,
		},
		{
			Name: "dataset value",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
				MustBuild(),
			Expected: NewValueAndDatasetValue(ValueTypeString, ValueTypeString.ValueFrom("vvv")),
		},
		{
			Name:     "dataset value missing",
			Expected: NewValueAndDatasetValue(ValueTypeString, ValueTypeString.ValueFrom("vvv")),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
		})
	}
}

func TestField_Datasets(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	dsid := NewDatasetID()

	tests := []struct {
		Name     string
		Field    *Field
		Expected []DatasetID
	}{
		{
			Name: "list of one datasets",
			Field: FieldFrom(p).
				Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).
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
