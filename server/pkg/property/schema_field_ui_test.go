package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSchemaFieldUI(t *testing.T) {
	var uir *SchemaFieldUI
	assert.Equal(t, SchemaFieldUI(""), SchemaFieldUIFrom(""))
	assert.Equal(t, uir, SchemaFieldUIFromRef(nil))
	ui := SchemaFieldUILayer
	assert.Equal(t, SchemaFieldUILayer, SchemaFieldUIFrom("layer"))
	assert.Equal(t, "layer", SchemaFieldUIFrom("layer").String())
	str := "layer"
	assert.Equal(t, &ui, SchemaFieldUIFromRef(&str))
	assert.Equal(t, &str, SchemaFieldUIFromRef(&str).StringRef())
}
