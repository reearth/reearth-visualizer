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
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// ctxCheckingFile wraps a real gateway.File and records the context.Err() seen
// by RemoveBuiltScene. If the context is already canceled, it fails the call
// with ctx.Err() instead of delegating, mirroring how a real outbound client
// (GCS/S3) would behave on a canceled context.
type ctxCheckingFile struct {
	gateway.File
	removeBuiltSceneCalled bool
	removeBuiltSceneCtxErr error
}

func (f *ctxCheckingFile) RemoveBuiltScene(ctx context.Context, name string) error {
	f.removeBuiltSceneCalled = true
	f.removeBuiltSceneCtxErr = ctx.Err()
	if ctx.Err() != nil {
		return ctx.Err()
	}
	return f.File.RemoveBuiltScene(ctx, name)
}

// TestProject_Publish_UnpublishCleanupSurvivesCanceledContext is a regression
// test for REL-10: the post-commit GCS cleanup in Publish ran on the request
// ctx, so a client disconnecting right after the commit (ctx canceled) made
// the cleanup fail every time -- silently, since the failure is only logged.
// For an unpublish, that stale file stays publicly readable even though the
// DB says Private. The fix detaches the cleanup from the request ctx.
func TestProject_Publish_UnpublishCleanupSurvivesCanceledContext(t *testing.T) {
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
		User:            db.User,
		Workspace:       db.Workspace,
		Project:         db.Project,
		ProjectMetadata: db.ProjectMetadata,
		Scene:           db.Scene,
		Property:        db.Property,
		PropertySchema:  db.PropertySchema,
		Asset:           db.Asset,
		Plugin:          db.Plugin,
		NLSLayer:        db.NLSLayer,
		Style:           db.Style,
		Storytelling:    db.Storytelling,
		SceneLock:       db.SceneLock,
		Transaction:     &usecasex.NopTransaction{},
	}

	fakeFile := &ctxCheckingFile{File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com"))}
	gateways := &gateway.Container{
		File:          fakeFile,
		PolicyChecker: mockPolicyChecker,
	}

	projectUC := NewProject(repos, gateways)

	prj := project.New().NewID().Workspace(wsID).Name("Test Project").MustBuild()
	require.NoError(t, db.Project.Save(ctx, prj))
	sc := lo.Must(scene.New().NewID().Workspace(wsID).Project(prj.ID()).Build())
	require.NoError(t, db.Scene.Save(ctx, sc))

	operator := &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: accountsID.WorkspaceIDList{wsID},
			OwningWorkspaces:   accountsID.WorkspaceIDList{wsID},
		},
	}

	_, err := projectUC.Publish(ctx, interfaces.PublishProjectParam{
		ID:     prj.ID(),
		Status: project.PublishmentStatusPublic,
	}, operator)
	require.NoError(t, err)

	// Unpublish with an already-canceled context, simulating the client
	// disconnecting right after the DB commit.
	canceledCtx, cancel := context.WithCancel(context.Background())
	cancel()

	_, err = projectUC.Publish(canceledCtx, interfaces.PublishProjectParam{
		ID:     prj.ID(),
		Status: project.PublishmentStatusPrivate,
	}, operator)
	require.NoError(t, err, "a cleanup failure must not fail the whole unpublish")

	assert.True(t, fakeFile.removeBuiltSceneCalled, "cleanup must still run")
	assert.NoError(t, fakeFile.removeBuiltSceneCtxErr,
		"REL-10 fix: cleanup must run on a context detached from the canceled request context")
}
