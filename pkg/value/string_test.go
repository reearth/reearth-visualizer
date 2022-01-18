package value

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyString_I2V(t *testing.T) {
	s := "foobar"
	n := 1.12
	u, _ := url.Parse("https://reearth.io")

	tests := []struct {
		name  string
		args  []interface{}
		want1 interface{}
		want2 bool
	}{
		{
			name:  "string",
			args:  []interface{}{s, &s},
			want1: "foobar",
			want2: true,
		},
		{
			name:  "number",
			args:  []interface{}{n, &n},
			want1: "1.12",
			want2: true,
		},
		{
			name:  "url",
			args:  []interface{}{u},
			want1: "https://reearth.io",
			want2: true,
		},
		{
			name:  "nil",
			args:  []interface{}{(*string)(nil), nil},
			want1: nil,
			want2: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyString{}
			for i, v := range tt.args {
				got1, got2 := p.I2V(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}
