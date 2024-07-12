package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValueAndDatasetValue_Type(t *testing.T) {
	tests := []struct {
		name   string
		target *ValueAndDatasetValue
		want   ValueType
	}{
		{
			name:   "ok",
			target: &ValueAndDatasetValue{t: ValueTypeString},
			want:   ValueTypeString,
		},
		{
			name:   "empty",
			target: &ValueAndDatasetValue{},
			want:   ValueTypeUnknown,
		},
		{
			name:   "nil",
			target: nil,
			want:   ValueTypeUnknown,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Type())
		})
	}
}
