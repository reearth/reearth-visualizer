package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestItemBuilder_Tags(t *testing.T) {
	l := NewTagList(nil)
	b := NewItem().NewID().Tags(l).MustBuild()
	assert.Same(t, l, b.Tags())
}
