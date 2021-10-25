package layer

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
	"github.com/stretchr/testify/assert"
)

func TestItemBuilder_Tags(t *testing.T) {
	l := tag.NewListFromTags([]id.TagID{id.NewTagID()})
	b := NewItem().NewID().Tags(l).MustBuild()
	assert.Same(t, l, b.Tags())
}
