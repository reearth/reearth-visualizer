package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestStyle_FindByID_EmptyResultIsNotFound is a regression test for REL-10: a
// scene-filtered findOne can match a document that the filter then drops,
// leaving Result empty while FindOne returns no error. Indexing Result[0]
// panicked; it must report not-found instead. The same guard was applied to
// scene/property/project findOne.
func TestStyle_FindByID_EmptyResultIsNotFound(t *testing.T) {
	ctx := context.Background()
	c := mongotest.Connect(t)(t)
	r := NewStyle(mongox.NewClientWithDatabase(c))

	victimScene := id.NewSceneID()
	callerScene := id.NewSceneID()
	st := scene.NewStyle().NewID().Name("s").Value(&scene.StyleValue{"k": "v"}).Scene(victimScene).MustBuild()
	require.NoError(t, r.Save(ctx, *st))

	scoped := r.Filtered(repo.SceneFilter{Readable: id.SceneIDList{callerScene}})
	got, err := scoped.FindByID(ctx, st.ID())
	assert.Nil(t, got)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
}
