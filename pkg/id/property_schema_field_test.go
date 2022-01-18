package id

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPropertySchemaFieldIDFrom(t *testing.T) {
	input1 := "testStringId"
	expected1 := PropertySchemaFieldID(input1)

	tests := []struct {
		name     string
		input    *string
		expected *PropertySchemaFieldID
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

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			result := PropertySchemaFieldIDFrom(tc.input)
			assert.Equal(t, tc.expected, result)
		})
	}
}

func TestPropertySchemaFieldID_Ref(t *testing.T) {
	propertySchemaFieldID := PropertySchemaFieldID("test")

	assert.Equal(t, &propertySchemaFieldID, propertySchemaFieldID.Ref())
}

func TestPropertySchemaFieldID_CopyRef(t *testing.T) {
	propertySchemaFieldID := PropertySchemaFieldID("test")

	assert.Equal(t, propertySchemaFieldID, *propertySchemaFieldID.CopyRef())

	assert.False(t, propertySchemaFieldID.Ref() == propertySchemaFieldID.CopyRef())
}

func TestPropertySchemaFieldID_String(t *testing.T) {
	propertySchemaFieldID := PropertySchemaFieldID("test")

	assert.Equal(t, "test", propertySchemaFieldID.String())
}

func TestPropertySchemaFieldID_StringRef(t *testing.T) {
	propertySchemaFieldID := PropertySchemaFieldID("test")

	assert.Equal(t, "test", *propertySchemaFieldID.StringRef())
}
