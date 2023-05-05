package dataset

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewNilableValue(t *testing.T) {
	type args struct {
		t ValueType
		v *Value
	}

	tests := []struct {
		name string
		args args
		want *OptionalValue
	}{
		{
			name: "default type",
			args: args{
				t: ValueTypeString,
				v: ValueTypeString.ValueFrom("foo"),
			},
			want: &OptionalValue{ov: *value.OptionalFrom(value.TypeString.ValueFrom("foo", nil))},
		},
		{
			name: "nil value",
			args: args{
				t: ValueTypeString,
			},
			want: &OptionalValue{ov: *value.NewOptional(value.TypeString, nil)},
		},
		{
			name: "invalid value",
			args: args{
				t: ValueTypeNumber,
				v: ValueTypeString.ValueFrom("foo"),
			},
			want: nil,
		},
		{
			name: "invalid type",
			args: args{
				t: ValueTypeUnknown,
				v: ValueTypeString.ValueFrom("foo"),
			},
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewOptionalValue(tt.args.t, tt.args.v))
		})
	}
}

func TestOptionalValueFrom(t *testing.T) {
	type args struct {
		v *Value
	}

	tests := []struct {
		name string
		args args
		want *OptionalValue
	}{
		{
			name: "default type",
			args: args{
				v: ValueTypeString.ValueFrom("foo"),
			},
			want: &OptionalValue{ov: *value.NewOptional(value.TypeString, value.TypeString.ValueFrom("foo", nil))},
		},
		{
			name: "empty value",
			args: args{
				v: &Value{v: value.Value{}},
			},
			want: nil,
		},
		{
			name: "nil value",
			args: args{},
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, OptionalValueFrom(tt.args.v))
		})
	}
}

func TestOptionalValue_Type(t *testing.T) {
	tests := []struct {
		name  string
		value *OptionalValue
		want  ValueType
	}{
		{
			name:  "ok",
			value: &OptionalValue{ov: *value.NewOptional(value.TypeBool, nil)},
			want:  ValueTypeBool,
		},
		{
			name:  "empty",
			value: &OptionalValue{},
			want:  ValueTypeUnknown,
		},
		{
			name:  "nil",
			value: nil,
			want:  ValueTypeUnknown,
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

func TestOptionalValue_Value(t *testing.T) {
	tests := []struct {
		name  string
		value *OptionalValue
		want  *Value
	}{
		{
			name:  "ok",
			value: &OptionalValue{ov: *value.OptionalFrom(value.TypeString.ValueFrom("foobar", nil))},
			want:  ValueTypeString.ValueFrom("foobar"),
		},
		{
			name:  "empty",
			value: &OptionalValue{},
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
			res := tt.value.Value()
			assert.Equal(t, tt.want, res)
			if res != nil {
				assert.NotSame(t, tt.want, res)
			}
		})
	}
}

func TestOptionalValue_TypeAndValue(t *testing.T) {
	tests := []struct {
		name  string
		value *OptionalValue
		wantt ValueType
		wantv *Value
	}{
		{
			name:  "ok",
			value: &OptionalValue{ov: *value.OptionalFrom(value.TypeString.ValueFrom("foobar", nil))},
			wantt: ValueTypeString,
			wantv: ValueTypeString.ValueFrom("foobar"),
		},
		{
			name:  "empty",
			value: &OptionalValue{},
			wantt: ValueTypeUnknown,
			wantv: nil,
		},
		{
			name:  "nil",
			value: nil,
			wantt: ValueTypeUnknown,
			wantv: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ty, tv := tt.value.TypeAndValue()
			assert.Equal(t, tt.wantt, ty)
			assert.Equal(t, tt.wantv, tv)
			if tv != nil {
				assert.NotSame(t, tt.wantv, tv)
			}
		})
	}
}

func TestOptionalValue_SetValue(t *testing.T) {
	type args struct {
		v *Value
	}

	tests := []struct {
		name    string
		value   *OptionalValue
		args    args
		invalid bool
	}{
		{
			name:  "set",
			value: &OptionalValue{ov: *value.OptionalFrom(value.TypeString.ValueFrom("foo", nil))},
			args:  args{v: ValueTypeString.ValueFrom("foobar")},
		},
		{
			name:  "set to nil",
			value: &OptionalValue{ov: *value.NewOptional(value.TypeString, nil)},
			args:  args{v: ValueTypeString.ValueFrom("foobar")},
		},
		{
			name:    "invalid value",
			value:   &OptionalValue{ov: *value.NewOptional(value.TypeString, nil)},
			args:    args{v: ValueTypeNumber.ValueFrom(1)},
			invalid: true,
		},
		{
			name: "nil value",
			args: args{v: ValueTypeNumber.ValueFrom(1)},
		},
		{
			name:    "empty",
			value:   &OptionalValue{},
			args:    args{v: ValueTypeNumber.ValueFrom(1)},
			invalid: true,
		},
		{
			name: "nil",
			args: args{v: ValueTypeNumber.ValueFrom(1)},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var v *Value
			if tt.value != nil {
				v = tt.value.Value()
			}

			tt.value.SetValue(tt.args.v)

			if tt.value != nil {
				if tt.invalid {
					assert.Equal(t, v, tt.value.Value())
				} else {
					assert.Equal(t, tt.args.v, tt.value.Value())
				}
			}
		})
	}
}

func TestOptionalValue_Clone(t *testing.T) {
	tests := []struct {
		name   string
		target *OptionalValue
	}{
		{
			name: "ok",
			target: &OptionalValue{
				ov: *value.NewOptional(value.TypeString, value.TypeString.ValueFrom("foo", nil)),
			},
		},
		{
			name:   "empty",
			target: &OptionalValue{},
		},
		{
			name:   "nil",
			target: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.target.Clone()
			assert.Equal(t, tt.target, res)
			if tt.target != nil {
				assert.NotSame(t, tt.target, res)
			}
		})
	}
}

func TestOptionalValue_Cast(t *testing.T) {
	type args struct {
		t ValueType
	}

	tests := []struct {
		name   string
		target *OptionalValue
		args   args
		want   *OptionalValue
	}{
		{
			name:   "diff type",
			target: &OptionalValue{ov: *value.OptionalFrom(value.TypeNumber.ValueFrom(1.1, nil))},
			args:   args{t: ValueTypeString},
			want:   &OptionalValue{ov: *value.OptionalFrom(value.TypeString.ValueFrom("1.1", nil))},
		},
		{
			name:   "same type",
			target: &OptionalValue{ov: *value.OptionalFrom(value.TypeNumber.ValueFrom(1.1, nil))},
			args:   args{t: ValueTypeNumber},
			want:   &OptionalValue{ov: *value.OptionalFrom(value.TypeNumber.ValueFrom(1.1, nil))},
		},
		{
			name:   "to string",
			target: &OptionalValue{ov: *value.OptionalFrom(value.TypeLatLng.ValueFrom(LatLng{Lat: 1, Lng: 2}, nil))},
			args:   args{t: ValueTypeString},
			want:   &OptionalValue{ov: *value.OptionalFrom(value.TypeString.ValueFrom("2.000000, 1.000000", nil))},
		},
		{
			name:   "empty",
			target: &OptionalValue{},
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
