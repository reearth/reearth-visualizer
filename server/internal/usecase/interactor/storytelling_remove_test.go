package interactor

import (
	"context"
	"errors"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// setupStorytellingRemoveTest builds a Storytelling interactor plus a story ready to
// remove, wired to the given transaction so a test can control its commit/rollback
// behavior.
func setupStorytellingRemoveTest(t *testing.T, tr usecasex.Transaction) (interfaces.Storytelling, id.StoryID, *usecase.Operator) {
	t.Helper()
	ctx := context.Background()

	mockPolicyChecker := new(MockPolicyChecker)
	mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
		Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
		Maybe()

	db := memory.New()
	wsID := accountsID.NewWorkspaceID()
	ws := accountsWorkspace.New().ID(wsID).MustBuild()
	require.NoError(t, db.Workspace.Save(ctx, ws))

	repos := &repo.Container{
		Workspace:    db.Workspace,
		Project:      db.Project,
		Scene:        db.Scene,
		Property:     db.Property,
		Storytelling: db.Storytelling,
		Transaction:  tr,
	}
	gateways := &gateway.Container{
		File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
		PolicyChecker: mockPolicyChecker,
	}
	storytellingUC := NewStorytelling(repos, gateways)

	prj := project.New().NewID().Workspace(wsID).Name("Test Project").MustBuild()
	require.NoError(t, db.Project.Save(ctx, prj))
	sc := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Build())
	require.NoError(t, db.Scene.Save(ctx, sc))

	story := storytelling.NewStory().NewID().Scene(sc.ID()).Title("Test Story").MustBuild()
	require.NoError(t, db.Storytelling.Save(ctx, *story))

	operator := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{wsID},
			OwningWorkspaces:   accountsID.WorkspaceIDList{wsID},
		},
		WritableScenes: []id.SceneID{sc.ID()},
	}

	return storytellingUC, story.Id(), operator
}

// TestStorytelling_Remove_CommitsTransaction is a regression test: Remove opened a
// transaction but never called tx.Commit() before returning, so per usecasex.Tx's own
// contract ("End... do commit if Commit() was called once, or else do rollback"), every
// call rolled back instead of persisting the removal. usecasex.NopTransaction doesn't
// undo any writes on rollback (the in-memory repos already reflect them either way), so
// this asserts on IsCommitted() directly -- the one signal that actually distinguishes a
// committed transaction from a silently rolled-back one.
func TestStorytelling_Remove_CommitsTransaction(t *testing.T) {
	tr := &usecasex.NopTransaction{}
	storytellingUC, storyID, operator := setupStorytellingRemoveTest(t, tr)

	_, err := storytellingUC.Remove(context.Background(), interfaces.RemoveStoryInput{StoryID: storyID}, operator)
	require.NoError(t, err)

	assert.True(t, tr.IsCommitted(), "Remove must commit its transaction, not silently roll it back")
}

// TestStorytelling_Remove_PropagatesCommitError is a regression test: Remove's
// unnamed return values meant the deferred tx.End error was assigned to a local err
// variable that the final `return &inp.StoryID, nil` never read, so a failed commit
// was silently reported as a successful removal. Named returns make the deferred
// assignment reach the actual return value.
func TestStorytelling_Remove_PropagatesCommitError(t *testing.T) {
	commitErr := errors.New("commit failed")
	tr := &usecasex.NopTransaction{CommitError: commitErr}
	storytellingUC, storyID, operator := setupStorytellingRemoveTest(t, tr)

	_, err := storytellingUC.Remove(context.Background(), interfaces.RemoveStoryInput{StoryID: storyID}, operator)

	assert.ErrorIs(t, err, commitErr, "Remove must propagate a failed commit instead of reporting success")
}
