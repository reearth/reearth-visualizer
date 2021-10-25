package layer

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
	"github.com/stretchr/testify/assert"
)

func TestGroupBuilder_Tags(t *testing.T) {
	l := tag.NewListFromTags([]id.TagID{id.NewTagID()})
	b := NewGroup().NewID().Tags(l).MustBuild()
	assert.Same(t, l, b.Tags())
}
