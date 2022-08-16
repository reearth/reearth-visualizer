package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/tag"
	"github.com/stretchr/testify/assert"
)

func TestLayer_FindByTag(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := layer.NewTagList([]layer.Tag{layer.NewTagGroup(t1.ID(), nil)})
	lg := layer.New().NewID().Tags(tl).Scene(sid).Group().MustBuild()

	repo := Layer{
		data: map[id.LayerID]layer.Layer{
			lg.ID(): lg,
		},
	}

	out, err := repo.FindByTag(ctx, t1.ID())
	assert.NoError(t, err)
	assert.Equal(t, layer.List{lg.LayerRef()}, out)
}
