package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGroupBuilder_Tags(t *testing.T) {
	l := NewTagList(nil)
	b := NewGroup().NewID().Tags(l).MustBuild()
	assert.Same(t, l, b.Tags())
}
