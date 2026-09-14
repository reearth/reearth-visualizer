package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestStorytelling_FindByID_RespectsSceneFilter: unfiltered returns/saves any
// scene; filtered returns not found outside the filter.
func TestStorytelling_FindByID_RespectsSceneFilter(t *testing.T) {
	ctx := context.Background()
	c := mongotest.Connect(t)(t)
	r := NewStorytelling(mongox.NewClientWithDatabase(c))

	victimScene := id.NewSceneID()
	callerScene := id.NewSceneID()

	page := storytelling.NewPage().NewID().Property(id.NewPropertyID()).MustBuild()
	story := storytelling.NewStory().
		NewID().
		Scene(victimScene).
		Title("Their story").
		Property(id.NewPropertyID()).
		Pages(storytelling.NewPageList([]*storytelling.Page{page})).
		MustBuild()
	require.NoError(t, r.Save(ctx, *story))

	t.Run("unfiltered read returns a story from another scene", func(t *testing.T) {
		got, err := r.FindByID(ctx, story.Id())
		assert.NoError(t, err)
		require.NotNil(t, got)
		assert.Equal(t, victimScene, got.Scene())
	})

	t.Run("unfiltered write persists a story from another scene", func(t *testing.T) {
		got, err := r.FindByID(ctx, story.Id())
		require.NoError(t, err)
		got.Rename("edited by someone else")

		assert.NoError(t, r.Save(ctx, *got), "Save on an unfiltered repo accepts any scene")

		reread, err := r.FindByID(ctx, story.Id())
		require.NoError(t, err)
		assert.Equal(t, "edited by someone else", reread.Title())
	})

	t.Run("scoping the read to the caller's scene is what blocks it", func(t *testing.T) {
		scoped := r.Filtered(repo.SceneFilter{
			Readable: id.SceneIDList{callerScene},
			Writable: id.SceneIDList{callerScene},
		})

		_, err := scoped.FindByID(ctx, story.Id())
		assert.Error(t, err, "a story outside the filter must not be readable")
	})
}
