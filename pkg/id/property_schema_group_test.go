package id

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPropertySchemaGroupIDFrom(t *testing.T) {
	t.Parallel()
	input1 := "testStringId"
	expected1 := PropertySchemaGroupID(input1)
	testCases := []struct {
		name     string
		input    *string
		expected *PropertySchemaGroupID
	}{
		{
			name:     "success:string input",
			input:    &input1,
			expected: &expected1,
		},
		{
			name:     "fail:nil pointer",
			input:    nil,
			expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			result := PropertySchemaGroupIDFrom(tc.input)
			assert.Equal(tt, tc.expected, result)
		})
	}
}

func TestPropertySchemaGroupID_Ref(t *testing.T) {
	PropertySchemaGroupID := PropertySchemaGroupID("test")

	assert.Equal(t, &PropertySchemaGroupID, PropertySchemaGroupID.Ref())
}

func TestPropertySchemaGroupID_CopyRef(t *testing.T) {
	PropertySchemaGroupID := PropertySchemaGroupID("test")

	assert.Equal(t, PropertySchemaGroupID, *PropertySchemaGroupID.CopyRef())

	assert.False(t, PropertySchemaGroupID.Ref() == PropertySchemaGroupID.CopyRef())
}

func TestPropertySchemaGroupID_String(t *testing.T) {
	PropertySchemaGroupID := PropertySchemaGroupID("test")

	assert.Equal(t, "test", PropertySchemaGroupID.String())
}

func TestPropertySchemaGroupID_StringRef(t *testing.T) {
	PropertySchemaGroupID := PropertySchemaGroupID("test")

	assert.Equal(t, "test", *PropertySchemaGroupID.StringRef())
}
