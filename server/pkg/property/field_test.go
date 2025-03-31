package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

var (
	testField1 = NewField(testSchemaField1.ID()).Value(OptionalValueFrom(ValueTypeString.ValueFrom("aaa"))).MustBuild()
	testField2 = NewField(testSchemaField3.ID()).Value(NewOptionalValue(ValueTypeLatLng, nil)).MustBuild()
)

func TestField_Clone(t *testing.T) {
	b := NewField("a").Value(OptionalValueFrom(ValueTypeString.ValueFrom("vvv"))).Build()

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
				field: id.PropertyFieldID("foobar"),
				v:     OptionalValueFrom(ValueTypeString.ValueFrom("-123")),
			},
			args: args{t: ValueTypeNumber},
			want: &Field{
				field: id.PropertyFieldID("foobar"),
				v:     OptionalValueFrom(ValueTypeNumber.ValueFrom(-123)),
			},
		},
		{
			name: "failed",
			target: &Field{
				field: id.PropertyFieldID("foobar"),
				v:     OptionalValueFrom(ValueTypeString.ValueFrom("foo")),
			},
			args: args{t: ValueTypeLatLng},
			want: &Field{
				field: id.PropertyFieldID("foobar"),
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
