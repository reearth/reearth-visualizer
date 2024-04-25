package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewOptional(t *testing.T) {
	type args struct {
		t Type
		v *Value
	}

	tests := []struct {
		name string
		args args
		want *Optional
	}{
		{
			name: "default type",
			args: args{
				t: TypeString,
				v: TypeString.ValueFrom("foo", nil),
			},
			want: &Optional{t: TypeString, v: TypeString.ValueFrom("foo", nil)},
		},
		{
			name: "custom type",
			args: args{
				t: Type("foo"),
				v: &Value{t: Type("foo")},
			},
			want: &Optional{t: Type("foo"), v: &Value{t: Type("foo")}},
		},
		{
			name: "nil value",
			args: args{
				t: Type("foo"),
			},
			want: &Optional{t: Type("foo"), v: nil},
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
			assert.Equal(t, tt.want, NewOptional(tt.args.t, tt.args.v))
		})
	}
}

func TestOptionalFrom(t *testing.T) {
	type args struct {
		v *Value
	}

	tests := []struct {
		name string
		args args
		want *Optional
	}{
		{
			name: "default type",
			args: args{
				v: TypeString.ValueFrom("foo", nil),
			},
			want: &Optional{t: TypeString, v: TypeString.ValueFrom("foo", nil)},
		},
		{
			name: "custom type",
			args: args{
				v: &Value{t: Type("foo")},
			},
			want: &Optional{t: Type("foo"), v: &Value{t: Type("foo")}},
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
			assert.Equal(t, tt.want, OptionalFrom(tt.args.v))
		})
	}
}

func TestOptional_Type(t *testing.T) {
	tests := []struct {
		name  string
		value *Optional
		want  Type
	}{
		{
			name:  "ok",
			value: &Optional{t: Type("foo")},
			want:  Type("foo"),
		},
		{
			name:  "empty",
			value: &Optional{},
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

func TestOptional_Value(t *testing.T) {
	tests := []struct {
		name  string
		value *Optional
		want  *Value
	}{
		{
			name:  "ok",
			value: &Optional{t: TypeString, v: &Value{t: TypeString, v: "foobar"}},
			want:  &Value{t: TypeString, v: "foobar"},
		},
		{
			name:  "empty",
			value: &Optional{},
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

func TestOptional_TypeAndValue(t *testing.T) {
	tests := []struct {
		name  string
		value *Optional
		wantt Type
		wantv *Value
	}{
		{
			name:  "ok",
			value: &Optional{t: TypeString, v: &Value{t: TypeString, v: "foobar"}},
			wantt: TypeString,
			wantv: &Value{t: TypeString, v: "foobar"},
		},
		{
			name:  "empty",
			value: &Optional{},
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

func TestOptional_SetValue(t *testing.T) {
	type args struct {
		v *Value
	}

	tests := []struct {
		name    string
		value   *Optional
		args    args
		invalid bool
	}{
		{
			name: "set",
			value: &Optional{
				t: TypeString,
				v: &Value{t: TypeString, v: "foobar"},
			},
			args: args{v: &Value{t: TypeString, v: "bar"}},
		},
		{
			name: "set to nil",
			value: &Optional{
				t: TypeString,
			},
			args: args{v: &Value{t: TypeString, v: "bar"}},
		},
		{
			name: "invalid value",
			value: &Optional{
				t: TypeNumber,
				v: &Value{t: TypeNumber, v: 1},
			},
			args:    args{v: &Value{t: TypeString, v: "bar"}},
			invalid: true,
		},
		{
			name: "nil value",
			value: &Optional{
				t: TypeNumber,
				v: &Value{t: TypeNumber, v: 1},
			},
		},
		{
			name:    "empty",
			value:   &Optional{},
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

func TestOptional_Clone(t *testing.T) {
	tests := []struct {
		name   string
		target *Optional
	}{
		{
			name:   "ok",
			target: &Optional{t: TypeString, v: TypeString.ValueFrom("foo", nil)},
		},
		{
			name:   "empty",
			target: &Optional{},
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

func TestOptional_Cast(t *testing.T) {
	type args struct {
		t Type
		p TypePropertyMap
	}

	tests := []struct {
		name   string
		target *Optional
		args   args
		want   *Optional
	}{
		{
			name:   "diff type",
			target: &Optional{t: TypeNumber, v: TypeNumber.ValueFrom(1.1, nil)},
			args:   args{t: TypeString},
			want:   &Optional{t: TypeString, v: TypeString.ValueFrom("1.1", nil)},
		},
		{
			name:   "same type",
			target: &Optional{t: TypeNumber, v: TypeNumber.ValueFrom(1.1, nil)},
			args:   args{t: TypeNumber},
			want:   &Optional{t: TypeNumber, v: TypeNumber.ValueFrom(1.1, nil)},
		},
		{
			name:   "nil value",
			target: &Optional{t: TypeNumber},
			args:   args{t: TypeString},
			want:   &Optional{t: TypeString},
		},
		{
			name:   "to string",
			target: &Optional{t: TypeLatLng, v: TypeLatLng.ValueFrom(LatLng{Lat: 1, Lng: 2}, nil)},
			args:   args{t: TypeString},
			want:   &Optional{t: TypeString, v: TypeString.ValueFrom("2.000000, 1.000000", nil)},
		},
		{
			name:   "empty",
			target: &Optional{},
			args:   args{t: TypeString},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{t: TypeString},
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Cast(tt.args.t, tt.args.p))
		})
	}
}
