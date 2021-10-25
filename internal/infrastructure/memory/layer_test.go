package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/tag"
	"github.com/stretchr/testify/assert"
)

func TestLayer_FindByTag(t *testing.T) {
	ctx := context.Background()
	sid := id.NewSceneID()
	sl := []id.SceneID{sid}
	t1, _ := tag.NewItem().NewID().Scene(sid).Label("item").Build()
	tl := tag.NewListFromTags([]id.TagID{t1.ID()})
	lg := layer.New().NewID().Tags(tl).Scene(sid).Group().MustBuild()
	repo := Layer{
		data: map[id.LayerID]layer.Layer{
			lg.ID(): lg,
		},
	}
	out, err := repo.FindByTag(ctx, t1.ID(), sl)
	assert.NoError(t, err)
	l := layer.Layer(lg)
	assert.Equal(t, layer.List{&l}, out)
}
