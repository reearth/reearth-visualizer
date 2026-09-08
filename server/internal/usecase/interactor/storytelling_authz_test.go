package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// setupTwoWorkspaceStory: a story in a scene the operator cannot access, and a
// separate scene it can write.
func setupTwoWorkspaceStory(ctx context.Context, t *testing.T) (*storytellingTestEnv, id.SceneID, *storytelling.Story) {
	t.Helper()
	env := setupStorytellingTestEnv(ctx, t)
	env.mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
		Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
		Maybe()

	// the operator's own scene
	ownPrj := project.New().NewID().Workspace(env.wsID).Name("Mine").MustBuild()
	require.NoError(t, env.db.Project.Save(ctx, ownPrj))
	ownScene := lo.Must(scene.New().NewID().Workspace(env.wsID).Project(ownPrj.ID()).Build())
	require.NoError(t, env.db.Scene.Save(ctx, ownScene))

	// somebody else's workspace, scene and story
	victimWs := accountsID.NewWorkspaceID()
	require.NoError(t, env.db.Workspace.Save(ctx, accountsWorkspace.New().ID(victimWs).MustBuild()))
	victimPrj := project.New().NewID().Workspace(victimWs).Name("Theirs").MustBuild()
	require.NoError(t, env.db.Project.Save(ctx, victimPrj))
	victimScene := lo.Must(scene.New().NewID().Workspace(victimWs).Project(victimPrj.ID()).Build())
	require.NoError(t, env.db.Scene.Save(ctx, victimScene))

	page := storytelling.NewPage().NewID().Property(id.NewPropertyID()).MustBuild()
	story := storytelling.NewStory().
		NewID().
		Scene(victimScene.ID()).
		Title("Their story").
		Property(id.NewPropertyID()).
		Pages(storytelling.NewPageList([]*storytelling.Page{page})).
		MustBuild()
	require.NoError(t, env.db.Storytelling.Save(ctx, *story))

	// the operator can write only their own scene
	env.operator.WritableScenes = []id.SceneID{ownScene.ID()}
	env.operator.AcOperator = &accountsWorkspace.Operator{
		WritableWorkspaces: accountsID.WorkspaceIDList{env.wsID},
		OwningWorkspaces:   accountsID.WorkspaceIDList{env.wsID},
	}

	return env, ownScene.ID(), story
}

// TestStorytelling_UpdatePage_RejectsForeignScene: story not in the named scene => fail.
func TestStorytelling_UpdatePage_RejectsForeignScene(t *testing.T) {
	ctx := context.Background()
	env, ownScene, story := setupTwoWorkspaceStory(ctx, t)

	title := "pwned"
	_, _, err := env.storytellingUC.UpdatePage(ctx, interfaces.UpdatePageParam{
		SceneID: ownScene,   // a scene the caller may write
		StoryID: story.Id(), // a story in a different scene
		PageID:  story.Pages().Pages()[0].Id(),
		Title:   &title,
	}, env.operator)

	assert.Error(t, err, "story not in the named scene must fail")

	stored, ferr := env.db.Storytelling.FindByID(ctx, story.Id())
	require.NoError(t, ferr)
	assert.NotEqual(t, title, stored.Pages().Pages()[0].Title(), "the page must be unchanged")
}

// TestStorytelling_RemovePage_RejectsForeignScene: same, for delete.
func TestStorytelling_RemovePage_RejectsForeignScene(t *testing.T) {
	ctx := context.Background()
	env, ownScene, story := setupTwoWorkspaceStory(ctx, t)
	pageID := story.Pages().Pages()[0].Id()

	_, _, err := env.storytellingUC.RemovePage(ctx, interfaces.RemovePageParam{
		SceneID: ownScene,
		StoryID: story.Id(),
		PageID:  pageID,
	}, env.operator)

	assert.Error(t, err, "story not in the named scene must fail")

	stored, ferr := env.db.Storytelling.FindByID(ctx, story.Id())
	require.NoError(t, ferr)
	assert.NotNil(t, stored.Pages().Page(pageID), "the page must still exist")
}

// TestStorytelling_CreateStory_SceneNotFound covers the denial-vs-not-found
// mislabel: CreateStory took a client-supplied scene id and, for a scene that
// did not exist, returned operation denied (CanWriteScene only checks the
// operator's writable list). It now looks the scene up first, so a missing
// scene is not found. Moving the lookup up also means no property is written
// before the scene is confirmed.
func TestStorytelling_CreateStory_SceneNotFound(t *testing.T) {
	ctx := context.Background()
	env := setupStorytellingTestEnv(ctx, t)

	story, err := env.storytellingUC.Create(ctx, interfaces.CreateStoryInput{
		SceneID: id.NewSceneID(), // never created
		Title:   "orphan",
	}, env.operator)

	assert.Nil(t, story)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.NotErrorIs(t, err, interfaces.ErrOperationDenied)
}

// TestStorytelling_PageMutations_SceneNotFound covers the same denial-vs-not-found
// mislabel on the story page mutations: CreatePage, UpdatePage and RemovePage
// authorized inp.SceneID before confirming the scene exists, so a scene that
// does not exist was reported as operation denied. Each now looks the scene up
// first.
func TestStorytelling_PageMutations_SceneNotFound(t *testing.T) {
	ctx := context.Background()
	env := setupStorytellingTestEnv(ctx, t)
	fakeScene := id.NewSceneID() // never created

	t.Run("CreatePage", func(t *testing.T) {
		story, page, err := env.storytellingUC.CreatePage(ctx, interfaces.CreatePageParam{
			SceneID: fakeScene,
			StoryID: id.NewStoryID(),
		}, env.operator)
		assert.Nil(t, story)
		assert.Nil(t, page)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
		assert.NotErrorIs(t, err, interfaces.ErrOperationDenied)
	})

	t.Run("UpdatePage", func(t *testing.T) {
		story, page, err := env.storytellingUC.UpdatePage(ctx, interfaces.UpdatePageParam{
			SceneID: fakeScene,
			StoryID: id.NewStoryID(),
			PageID:  id.NewPageID(),
		}, env.operator)
		assert.Nil(t, story)
		assert.Nil(t, page)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
		assert.NotErrorIs(t, err, interfaces.ErrOperationDenied)
	})

	t.Run("RemovePage", func(t *testing.T) {
		story, pageID, err := env.storytellingUC.RemovePage(ctx, interfaces.RemovePageParam{
			SceneID: fakeScene,
			StoryID: id.NewStoryID(),
			PageID:  id.NewPageID(),
		}, env.operator)
		assert.Nil(t, story)
		assert.Nil(t, pageID)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
		assert.NotErrorIs(t, err, interfaces.ErrOperationDenied)
	})
}
