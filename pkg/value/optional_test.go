package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewOptionalValue(t *testing.T) {
	type args struct {
		t Type
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
				t: TypeString,
				v: TypeString.ValueFrom("foo", nil),
			},
			want: &OptionalValue{t: TypeString, v: TypeString.ValueFrom("foo", nil)},
		},
		{
			name: "custom type",
			args: args{
				t: Type("foo"),
				v: &Value{t: Type("foo")},
			},
			want: &OptionalValue{t: Type("foo"), v: &Value{t: Type("foo")}},
		},
		{
			name: "nil value",
			args: args{
				t: Type("foo"),
			},
			want: &OptionalValue{t: Type("foo"), v: nil},
		},
		{
			name: "invalid value",
			args: args{
				t: TypeNumber,
				v: TypeString.ValueFrom("foo", nil),
			},
			want: nil,
		},
		{
			name: "invalid type",
			args: args{
				t: TypeUnknown,
				v: TypeString.ValueFrom("foo", nil),
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
				v: TypeString.ValueFrom("foo", nil),
			},
			want: &OptionalValue{t: TypeString, v: TypeString.ValueFrom("foo", nil)},
		},
		{
			name: "custom type",
			args: args{
				v: &Value{t: Type("foo")},
			},
			want: &OptionalValue{t: Type("foo"), v: &Value{t: Type("foo")}},
		},
		{
			name: "invalid value",
			args: args{
				v: &Value{v: "string"},
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
		want  Type
	}{
		{
			name:  "ok",
			value: &OptionalValue{t: Type("foo")},
			want:  Type("foo"),
		},
		{
			name:  "empty",
			value: &OptionalValue{},
			want:  TypeUnknown,
		},
		{
			name:  "nil",
			value: nil,
			want:  TypeUnknown,
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
			value: &OptionalValue{t: TypeString, v: &Value{t: TypeString, v: "foobar"}},
			want:  &Value{t: TypeString, v: "foobar"},
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
		wantt Type
		wantv *Value
	}{
		{
			name:  "ok",
			value: &OptionalValue{t: TypeString, v: &Value{t: TypeString, v: "foobar"}},
			wantt: TypeString,
			wantv: &Value{t: TypeString, v: "foobar"},
		},
		{
			name:  "empty",
			value: &OptionalValue{},
			wantt: TypeUnknown,
			wantv: nil,
		},
		{
			name:  "nil",
			value: nil,
			wantt: TypeUnknown,
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
			name: "set",
			value: &OptionalValue{
				t: TypeString,
				v: &Value{t: TypeString, v: "foobar"},
			},
			args: args{v: &Value{t: TypeString, v: "bar"}},
		},
		{
			name: "set to nil",
			value: &OptionalValue{
				t: TypeString,
			},
			args: args{v: &Value{t: TypeString, v: "bar"}},
		},
		{
			name: "invalid value",
			value: &OptionalValue{
				t: TypeNumber,
				v: &Value{t: TypeNumber, v: 1},
			},
			args:    args{v: &Value{t: TypeString, v: "bar"}},
			invalid: true,
		},
		{
			name: "nil value",
			value: &OptionalValue{
				t: TypeNumber,
				v: &Value{t: TypeNumber, v: 1},
			},
		},
		{
			name:    "empty",
			value:   &OptionalValue{},
			args:    args{v: &Value{t: TypeString, v: "bar"}},
			invalid: true,
		},
		{
			name: "nil",
			args: args{v: &Value{t: TypeString, v: "bar"}},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var v *Value
			if tt.value != nil {
				v = tt.value.v
			}

			tt.value.SetValue(tt.args.v)

			if tt.value != nil {
				if tt.invalid {
					assert.Same(t, v, tt.value.v)
				} else {
					assert.Equal(t, tt.args.v, tt.value.v)
					if tt.args.v != nil {
						assert.NotSame(t, tt.args.v, tt.value.v)
					}
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
			name:   "ok",
			target: &OptionalValue{t: TypeString, v: TypeString.ValueFrom("foo", nil)},
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
		t.Run(tt.name, func(t *testing.T) {
			res := tt.target.Clone()
			assert.Equal(t, tt.target, res)
			if tt.target != nil {
				assert.NotSame(t, tt.target, res)
			}
		})
	}
}
