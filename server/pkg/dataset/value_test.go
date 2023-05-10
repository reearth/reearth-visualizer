package dataset

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestValueType_None(t *testing.T) {
	tests := []struct {
		name string
		tr   ValueType
		want *OptionalValue
	}{
		{
			name: "default",
			tr:   ValueTypeString,
			want: &OptionalValue{ov: *value.NewOptional(value.TypeString, nil)},
		},
		{
			name: "unknown",
			tr:   ValueTypeUnknown,
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.tr.None())
		})
	}
}

func TestValue_IsEmpty(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  bool
	}{
		{
			name: "empty",
			want: true,
		},
		{
			name: "nil",
			want: true,
		},
		{
			name:  "non-empty",
			value: ValueTypeString.ValueFrom("foo"),
			want:  false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.IsEmpty())
		})
	}
}

func TestValue_Clone(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  *Value
	}{
		{
			name:  "ok",
			value: ValueTypeString.ValueFrom("foo"),
			want: &Value{
				v: *value.TypeString.ValueFrom("foo", nil),
			},
		},
		{
			name:  "nil",
			value: nil,
			want:  nil,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Clone())
		})
	}
}

func TestValue_Some(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  *OptionalValue
	}{
		{
			name: "ok",
			value: &Value{
				v: *value.TypeString.ValueFrom("foo", nil),
			},
			want: &OptionalValue{
				ov: *value.OptionalFrom(value.TypeString.ValueFrom("foo", nil)),
			},
		},
		{
			name:  "nil",
			value: nil,
			want:  nil,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Some())
		})
	}
}

func TestValue_Value(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  interface{}
	}{
		{
			name:  "ok",
			value: ValueTypeString.ValueFrom("foo"),
			want:  "foo",
		},
		{
			name:  "empty",
			value: &Value{},
		},
		{
			name: "nil",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if tt.want == nil {
				assert.Nil(t, tt.value.Value())
			} else {
				assert.Equal(t, tt.want, tt.value.Value())
			}
		})
	}
}

func TestValue_Type(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  ValueType
	}{
		{
			name:  "ok",
			value: ValueTypeString.ValueFrom("foo"),
			want:  ValueTypeString,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  ValueTypeUnknown,
		},
		{
			name: "nil",
			want: ValueTypeUnknown,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Type())
		})
	}
}

func TestValue_Interface(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  interface{}
	}{
		{
			name:  "string",
			value: ValueTypeString.ValueFrom("foo"),
			want:  "foo",
		},
		{
			name:  "empty",
			value: &Value{},
			want:  nil,
		},
		{
			name:  "nil",
			value: nil,
			want:  nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Interface())
		})
	}
}

func TestValue_Cast(t *testing.T) {
	type args struct {
		t ValueType
	}

	tests := []struct {
		name   string
		target *Value
		args   args
		want   *Value
	}{
		{
			name:   "diff type",
			target: ValueTypeNumber.ValueFrom(1.1),
			args:   args{t: ValueTypeString},
			want:   ValueTypeString.ValueFrom("1.1"),
		},
		{
			name:   "same type",
			target: ValueTypeNumber.ValueFrom(1.1),
			args:   args{t: ValueTypeNumber},
			want:   ValueTypeNumber.ValueFrom(1.1),
		},
		{
			name:   "to string",
			target: ValueTypeLatLng.ValueFrom(LatLng{Lat: 1, Lng: 2}),
			args:   args{t: ValueTypeString},
			want:   ValueTypeString.ValueFrom("2.000000, 1.000000"),
		},
		{
			name:   "invalid type",
			target: ValueTypeNumber.ValueFrom(1.1),
			args:   args{t: ValueTypeUnknown},
			want:   nil,
		},
		{
			name:   "empty",
			target: &Value{},
			args:   args{t: ValueTypeString},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{t: ValueTypeString},
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Cast(tt.args.t))
		})
	}
}
