package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

type tpmock struct {
	TypeProperty
}

func (*tpmock) I2V(i interface{}) (interface{}, bool) {
	return i.(string) + "a", true
}

func (*tpmock) V2I(v interface{}) (interface{}, bool) {
	return v.(string) + "bar", true
}

func TestType_Default(t *testing.T) {
	tests := []struct {
		name string
		tr   Type
		want bool
	}{
		{
			name: "default",
			tr:   TypeString,
			want: true,
		},
		{
			name: "custom",
			tr:   Type("foo"),
			want: false,
		},
		{
			name: "unknown",
			tr:   TypeUnknown,
			want: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.tr.Default())
		})
	}
}

func TestType_None(t *testing.T) {
	tests := []struct {
		name string
		tr   Type
		want *Optional
	}{
		{
			name: "default",
			tr:   TypeString,
			want: &Optional{t: TypeString},
		},
		{
			name: "custom",
			tr:   Type("foo"),
			want: &Optional{t: Type("foo")},
		},
		{
			name: "unknown",
			tr:   TypeUnknown,
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

func TestType_ValueFrom(t *testing.T) {
	tpm := TypePropertyMap{
		Type("foo"): &tpmock{},
	}

	type args struct {
		i interface{}
		p TypePropertyMap
	}

	tests := []struct {
		name string
		tr   Type
		args args
		want *Value
	}{
		{
			name: "default type",
			tr:   TypeString,
			args: args{
				i: "hoge",
			},
			want: &Value{t: TypeString, v: "hoge"},
		},
		{
			name: "custom type",
			tr:   Type("foo"),
			args: args{
				i: "hoge",
				p: tpm,
			},
			want: &Value{p: tpm, t: Type("foo"), v: "hogea"},
		},
		{
			name: "nil",
			tr:   TypeString,
			args: args{},
			want: nil,
		},
		{
			name: "unknown type",
			tr:   TypeUnknown,
			args: args{
				i: "hoge",
			},
			want: nil,
		},
		{
			name: "unknown type + custom type",
			tr:   Type("bar"),
			args: args{
				i: "hoge",
				p: tpm,
			},
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.tr.ValueFrom(tt.args.i, tt.args.p))
		})
	}
}

func TestType_JSONSchema(t *testing.T) {
	tests := []struct {
		name string
		tr   Type
		want map[string]any
	}{
		{
			name: "default",
			tr:   TypeString,
			want: map[string]any{"type": "string"},
		},
		{
			name: "custom",
			tr:   Type("foo"),
			want: nil,
		},
		{
			name: "unknown",
			tr:   TypeUnknown,
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.tr.JSONSchema(nil))
		})
	}
}
