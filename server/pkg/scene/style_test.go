package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStyle_Duplicate(t *testing.T) {
	name := "Test Style"
	value := &StyleValue{
		"key1": "value1",
		"key2": "value2",
	}
	sid := NewID()

	original := NewStyle().NewID().Name(name).Value(value).Scene(sid).MustBuild()

	duplicated := original.Duplicate()

	assert.NotNil(t, duplicated)
	assert.NotEqual(t, original.ID(), duplicated.ID())
	assert.Equal(t, original.Name(), duplicated.Name())
	assert.Equal(t, original.Value(), duplicated.Value())
	assert.Equal(t, original.Scene(), duplicated.Scene())
}
