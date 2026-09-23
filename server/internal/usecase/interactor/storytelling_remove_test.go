package interactor

import (
	"context"
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

// TestStorytelling_Remove_CommitsTransaction is a regression test: Remove opened a
// transaction but never called tx.Commit() before returning, so per usecasex.Tx's own
// contract ("End... do commit if Commit() was called once, or else do rollback"), every
// call rolled back instead of persisting the removal. usecasex.NopTransaction doesn't
// undo any writes on rollback (the in-memory repos already reflect them either way), so
// this asserts on IsCommitted() directly -- the one signal that actually distinguishes a
// committed transaction from a silently rolled-back one.
func TestStorytelling_Remove_CommitsTransaction(t *testing.T) {
	ctx := context.Background()

	mockPolicyChecker := new(MockPolicyChecker)
	mockPolicyChecker.On("CheckPolicy", mock.Anything, mock.Anything).
		Return(&gateway.PolicyCheckResponse{Allowed: true}, nil).
		Maybe()

	db := memory.New()
	wsID := accountsID.NewWorkspaceID()
	ws := accountsWorkspace.New().ID(wsID).MustBuild()
	require.NoError(t, db.Workspace.Save(ctx, ws))

	tr := &usecasex.NopTransaction{}
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

	_, err := storytellingUC.Remove(ctx, interfaces.RemoveStoryInput{StoryID: story.Id()}, operator)
	require.NoError(t, err)

	assert.True(t, tr.IsCommitted(), "Remove must commit its transaction, not silently roll it back")
}
