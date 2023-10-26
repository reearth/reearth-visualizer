package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyMap_I2V(t *testing.T) {
	validMap := map[string]interface{}{"key": "value"}
	invalidMap := "not a map"
	validJSONString := `{"key": "value"}`
	invalidJSONString := `{"key": "value"` // missing closing brace
	nilMapPointer := (*map[string]interface{})(nil)
	nonNilMapPointer := &validMap

	tests := []struct {
		name  string
		arg   interface{}
		want1 interface{}
		want2 bool
	}{
		{
			name:  "Valid map",
			arg:   validMap,
			want1: validMap,
			want2: true,
		},
		{
			name:  "Invalid type",
			arg:   invalidMap,
			want1: nil,
			want2: false,
		},
		{
			name:  "Valid JSON string",
			arg:   validJSONString,
			want1: validMap, // it should parse the JSON string into a map
			want2: true,
		},
		{
			name:  "Invalid JSON string",
			arg:   invalidJSONString,
			want1: nil,
			want2: false,
		},
		{
			name:  "Nil map pointer",
			arg:   nilMapPointer,
			want1: nil,
			want2: false,
		},
		{
			name:  "Non-nil map pointer",
			arg:   nonNilMapPointer,
			want1: validMap,
			want2: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p := &propertyMap{}
			got1, got2 := p.I2V(tt.arg)
			assert.Equal(t, tt.want1, got1)
			assert.Equal(t, tt.want2, got2)
		})
	}
}
