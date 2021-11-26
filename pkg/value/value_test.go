package value

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

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
			name: "non-empty",
			value: &Value{
				t: Type("hoge"),
				v: "foo",
			},
			want: false,
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
	tp := &tpmock{}
	tpm := TypePropertyMap{
		Type("hoge"): tp,
	}

	tests := []struct {
		name  string
		value *Value
		want  *Value
	}{
		{
			name: "ok",
			value: &Value{
				t: TypeString,
				v: "foo",
			},
			want: &Value{
				t: TypeString,
				v: "foo",
			},
		},
		{
			name: "custom type property",
			value: &Value{
				t: Type("hoge"),
				v: "foo",
				p: tpm,
			},
			want: &Value{
				t: Type("hoge"),
				v: "fooa",
				p: tpm,
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

func TestValue_Value(t *testing.T) {
	u, _ := url.Parse("https://reearth.io")
	tests := []struct {
		name  string
		value *Value
		want  interface{}
	}{
		{
			name:  "ok",
			value: &Value{t: TypeURL, v: u},
			want:  u,
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
				assert.Same(t, tt.want, tt.value.Value())
			}
		})
	}
}

func TestValue_Type(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  Type
	}{
		{
			name:  "ok",
			value: &Value{t: TypeString},
			want:  TypeString,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  TypeUnknown,
		},
		{
			name: "nil",
			want: TypeUnknown,
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

func TestValue_TypeProperty(t *testing.T) {
	tp := &tpmock{}
	tpm := TypePropertyMap{
		Type("hoge"): tp,
	}

	tests := []struct {
		name  string
		value *Value
		want  TypeProperty
	}{
		{
			name: "default type",
			value: &Value{
				v: "string",
				t: TypeString,
			},
			want: defaultTypes[TypeString],
		},
		{
			name: "custom type",
			value: &Value{
				v: "string",
				t: Type("hoge"),
				p: tpm,
			},
			want: tp,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  nil,
		},
		{
			name: "nil",
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.value.TypeProperty()
			if tt.want == nil {
				assert.Nil(t, res)
			} else {
				assert.Same(t, tt.want, res)
			}
		})
	}
}

func TestValue_Interface(t *testing.T) {
	tp := &tpmock{}
	tpm := TypePropertyMap{
		"foo": tp,
	}

	tests := []struct {
		name  string
		value *Value
		want  interface{}
	}{
		{
			name:  "string",
			value: &Value{t: TypeString, v: "hoge"},
			want:  "hoge",
		},
		{
			name:  "latlng",
			value: &Value{t: TypeLatLng, v: LatLng{Lat: 1, Lng: 2}},
			want:  LatLng{Lat: 1, Lng: 2},
		},
		{
			name: "custom",
			value: &Value{
				p: tpm,
				t: Type("foo"),
				v: "foo",
			},
			want: "foobar",
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
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.value.Interface())
		})
	}
}
