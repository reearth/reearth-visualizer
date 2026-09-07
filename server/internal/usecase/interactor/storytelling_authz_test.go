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
