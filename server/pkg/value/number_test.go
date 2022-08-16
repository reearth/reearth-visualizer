package value

import (
	"encoding/json"
	"math"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyNumber_I2V(t *testing.T) {
	z1 := 0
	z2 := 0.0
	z3 := "0"
	z4 := json.Number("0")
	z5 := json.Number("-0")
	n1 := 1.12
	n2 := "1.12"
	n3 := json.Number("1.12")
	nn1 := -0.11
	nn2 := "-0.11"
	nn3 := json.Number("-0.11")
	nan1 := math.NaN()
	nan2 := json.Number("NaN")
	inf1 := math.Inf(0)
	inf2 := json.Number("Infinity")
	infn1 := math.Inf(-1)
	infn2 := json.Number("-Infinity")

	tests := []struct {
		name  string
		args  []interface{}
		want1 interface{}
		want2 bool
	}{
		{
			name:  "zero",
			args:  []interface{}{z1, z2, z3, z4, z5, &z1, &z2, &z3, &z4, &z5},
			want1: 0.0,
			want2: true,
		},
		{
			name:  "float",
			args:  []interface{}{n1, n2, n3, &n1, &n2, &n3},
			want1: 1.12,
			want2: true,
		},
		{
			name:  "negative float",
			args:  []interface{}{nn1, nn2, nn3, &nn1, &nn2, &nn3},
			want1: -0.11,
			want2: true,
		},
		{
			name:  "nan",
			args:  []interface{}{nan1, nan2},
			want1: math.NaN(),
			want2: true,
		},
		{
			name:  "inf",
			args:  []interface{}{inf1, inf2},
			want1: math.Inf(0),
			want2: true,
		},
		{
			name:  "negative inf",
			args:  []interface{}{infn1, infn2},
			want1: math.Inf(-1),
			want2: true,
		},
		{
			name:  "nil",
			args:  []interface{}{"foo", (*float64)(nil), (*string)(nil), (*int)(nil), (*json.Number)(nil), nil},
			want1: nil,
			want2: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			p := &propertyNumber{}
			for i, v := range tt.args {
				got1, got2 := p.I2V(v)
				if f, ok := tt.want1.(float64); ok {
					if math.IsNaN(f) {
						assert.True(t, math.IsNaN(tt.want1.(float64)))
					} else {
						assert.Equal(t, tt.want1, got1, "test %d", i)
					}
				} else {
					assert.Equal(t, tt.want1, got1, "test %d", i)
				}
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}
