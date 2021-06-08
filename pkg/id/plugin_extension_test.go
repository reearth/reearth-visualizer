package id

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPluginExtensionIDFromRef(t *testing.T) {
	t.Parallel()
	input1 := "testStringId"
	expected1 := PluginExtensionID(input1)
	testCases := []struct {
		name     string
		input    *string
		expected *PluginExtensionID
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
			result := PluginExtensionIDFromRef(tc.input)
			assert.Equal(tt, tc.expected, result)
		})
	}
}

func TestPluginExtensionID_Ref(t *testing.T) {
	pluginExtensionID := PluginExtensionID("test")

	assert.Equal(t, &pluginExtensionID, pluginExtensionID.Ref())
}

func TestPluginExtensionID_CopyRef(t *testing.T) {
	pluginExtensionID := PluginExtensionID("test")

	assert.Equal(t, pluginExtensionID, *pluginExtensionID.CopyRef())

	assert.False(t, pluginExtensionID.Ref() == pluginExtensionID.CopyRef())
}

func TestPluginExtensionID_String(t *testing.T) {
	pluginExtensionID := PluginExtensionID("test")

	assert.Equal(t, "test", pluginExtensionID.String())
}

func TestPluginExtensionID_StringRef(t *testing.T) {
	pluginExtensionID := PluginExtensionID("test")

	assert.Equal(t, "test", *pluginExtensionID.StringRef())
}
