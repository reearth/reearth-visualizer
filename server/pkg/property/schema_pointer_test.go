package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
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
				SchemaGroup: id.PropertySchemaGroupID("a"),
				Field:       FieldID("b"),
			},
			want: &Pointer{
				schemaGroup: id.PropertySchemaGroupID("a").Ref(),
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
