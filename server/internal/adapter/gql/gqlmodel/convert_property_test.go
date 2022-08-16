package gqlmodel

import (
	"encoding/json"
	"testing"

	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

func TestFromPropertyValueAndType(t *testing.T) {
	type args struct {
		v interface{}
		t ValueType
	}

	tests := []struct {
		name string
		args args
		want *property.Value
	}{
		{
			name: "number",
			args: args{
				v: 1.1,
				t: ValueTypeNumber,
			},
			want: property.ValueTypeNumber.ValueFrom(1.1),
		},
		{
			name: "json number",
			args: args{
				v: json.Number("1.1"),
				t: ValueTypeNumber,
			},
			want: property.ValueTypeNumber.ValueFrom(1.1),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, FromPropertyValueAndType(tt.args.v, tt.args.t))
		})
	}
}
