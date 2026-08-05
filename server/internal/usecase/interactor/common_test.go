package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"
)

type recordingSceneLockRepo struct {
	saveLockCtxErr error
}

func (r *recordingSceneLockRepo) GetLock(context.Context, id.SceneID) (scene.LockMode, error) {
	return scene.LockModeFree, nil
}

func (r *recordingSceneLockRepo) GetAllLock(context.Context, id.SceneIDList) ([]scene.LockMode, error) {
	return nil, nil
}

func (r *recordingSceneLockRepo) SaveLock(ctx context.Context, _ id.SceneID, _ scene.LockMode) error {
	r.saveLockCtxErr = ctx.Err()
	return ctx.Err()
}

func (r *recordingSceneLockRepo) ReleaseAllLock(context.Context) error {
	return nil
}

// TestReleaseSceneLock_SurvivesCanceledContext is a regression test for REL-03:
// ReleaseSceneLock is deferred from publish flows using the same request context
// the publish itself used. If that request's context is already canceled (e.g.
// the client disconnected mid upload), calling SaveLock on the bare context fails
// with "context canceled" and leaves the scene stuck locked forever. This confirms
// the SaveLock call underneath still runs against a live context even when the
// caller's context is canceled first.
func TestReleaseSceneLock_SurvivesCanceledContext(t *testing.T) {
	repo := &recordingSceneLockRepo{}
	d := commonSceneLock{sceneLockRepo: repo}

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	d.ReleaseSceneLock(ctx, id.NewSceneID())

	assert.NoError(t, repo.saveLockCtxErr)
}
