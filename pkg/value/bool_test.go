package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyBool_I2V(t *testing.T) {
	tr := true
	fa := false
	trs1 := "true"
	trs2 := "TRUE"
	trs3 := "True"
	trs4 := "T"
	trs5 := "t"
	trs6 := "1"
	fas1 := "false"
	fas2 := "FALSE"
	fas3 := "False"
	fas4 := "F"
	fas5 := "f"
	fas6 := "0"

	tests := []struct {
		name  string
		args  []interface{}
		want1 interface{}
		want2 bool
	}{
		{
			name:  "true",
			args:  []interface{}{tr, trs1, trs2, trs3, trs4, trs5, trs6, &tr, &trs1, &trs2, &trs3, &trs4, &trs5, &trs6},
			want1: true,
			want2: true,
		},
		{
			name:  "false",
			args:  []interface{}{fa, fas1, fas2, fas3, fas4, fas5, fas6, &fa, &fas1, &fas2, &fas3, &fas4, &fas5, &fas6},
			want1: false,
			want2: true,
		},
		{
			name:  "nil",
			args:  []interface{}{"foo", (*bool)(nil), (*string)(nil), nil},
			want1: nil,
			want2: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			p := &propertyBool{}
			for i, v := range tt.args {
				got1, got2 := p.I2V(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}
