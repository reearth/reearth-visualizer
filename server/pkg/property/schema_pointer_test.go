package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSchemaFieldPointer_Pointer(t *testing.T) {
	tests := []struct {
		name   string
		target *SchemaFieldPointer
		want   *Pointer
	}{
		{
			name: "ok",
			target: &SchemaFieldPointer{
				SchemaGroup: SchemaGroupID("a"),
				Field:       FieldID("b"),
			},
			want: &Pointer{
				schemaGroup: SchemaGroupID("a").Ref(),
				item:        nil,
				field:       FieldID("b").Ref(),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Pointer())
		})
	}
}
