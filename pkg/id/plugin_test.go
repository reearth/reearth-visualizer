package id

import (
	"encoding"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

var _ encoding.TextMarshaler = (*PluginID)(nil)
var _ encoding.TextUnmarshaler = (*PluginID)(nil)

func TestPluginIDValidator(t *testing.T) {
	assert.True(t, validatePluginName("1cc.1_c-d"), "1cc.1_c-d")
	assert.True(t, validatePluginName(strings.Repeat("a", 100)), "100 chars")
	assert.False(t, validatePluginName(""), "empty")
	assert.False(t, validatePluginName("  "), "space")
	assert.False(t, validatePluginName("@bbb/aa-a_a"), "@bbb/aa-a_a")
	assert.False(t, validatePluginName("bbb a"), "bbb a")
	assert.False(t, validatePluginName("cccd="), "cccd=")
	assert.False(t, validatePluginName("reearth"), "reearth")
	assert.False(t, validatePluginName(strings.Repeat("a", 101)), "over 100 chars")
}
