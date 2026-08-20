package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"
)

type recordingSceneLockRepo struct {
	saveLockCalled bool
	saveLockCtxErr error
}

func (r *recordingSceneLockRepo) GetLock(context.Context, id.SceneID) (scene.LockMode, error) {
	return scene.LockModeFree, nil
}

func (r *recordingSceneLockRepo) GetAllLock(context.Context, id.SceneIDList) ([]scene.LockMode, error) {
	return nil, nil
}

func (r *recordingSceneLockRepo) SaveLock(ctx context.Context, _ id.SceneID, _ scene.LockMode) error {
	r.saveLockCalled = true
	r.saveLockCtxErr = ctx.Err()
	return ctx.Err()
}

func (r *recordingSceneLockRepo) ReleaseAllLock(context.Context) error {
	return nil
}

// TestReleaseSceneLock_SurvivesCanceledContext is a regression test for REL-03:
// ReleaseSceneLock is deferred from publish flows using the same request context
// the publish itself used. If that request's context is already canceled (e.g.
// the client disconnected mid-upload), calling SaveLock on the bare context fails
// with "context canceled" and leaves the scene stuck locked forever. This confirms
// the SaveLock call underneath still runs against a live context even when the
// caller's context is canceled first.
func TestReleaseSceneLock_SurvivesCanceledContext(t *testing.T) {
	repo := &recordingSceneLockRepo{}
	d := commonSceneLock{sceneLockRepo: repo}

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	d.ReleaseSceneLock(ctx, id.NewSceneID())

	assert.True(t, repo.saveLockCalled, "SaveLock must actually be called -- otherwise this test would pass even if ReleaseSceneLock stopped releasing the lock at all")
	assert.NoError(t, repo.saveLockCtxErr)
}

// TestIsCurrentHostAssets is a regression test: the check used to require a single string to
// start with both "assets/" and the current host at once, which no real absolute asset URL can
// satisfy -- so exports and asset replacement silently treated every real asset URL as not being
// an asset at all whenever a host was actually configured. This confirms relative asset paths and
// absolute URLs under the current host are both recognized.
func TestIsCurrentHostAssets(t *testing.T) {
	ctx := adapter.AttachCurrentHost(context.Background(), "https://api.example.com")

	assert.True(t, IsCurrentHostAssets(ctx, "assets/foo.png"), "a relative assets/ path must be recognized")
	assert.True(t, IsCurrentHostAssets(ctx, "/assets/foo.png"), "a rooted /assets path must be recognized")
	assert.True(t, IsCurrentHostAssets(ctx, "https://api.example.com/assets/foo.png"), "an absolute URL under the current host must be recognized")
	assert.False(t, IsCurrentHostAssets(ctx, "https://other-host.com/assets/foo.png"), "an absolute URL under a different host must not be recognized")
	assert.False(t, IsCurrentHostAssets(ctx, "https://api.example.com.evil.com/assets/foo.png"), "a host that merely shares a string prefix with the current host must not be recognized")
	assert.False(t, IsCurrentHostAssets(ctx, "/assets-foo.png"), "a path that merely shares a string prefix with /assets/ must not be recognized")
	assert.False(t, IsCurrentHostAssets(ctx, "https://api.example.com/some-other-path/foo.png"), "a same-host URL whose path is not under /assets/ must not be recognized")
}

// TestIsCurrentHostAssets_NoCurrentHost is a regression test: comparing hosts with a raw
// strings.HasPrefix meant that when no host was attached (CurrentHost returns ""), every string
// trivially satisfies the prefix check, so any absolute URL would be misclassified as an asset.
func TestIsCurrentHostAssets_NoCurrentHost(t *testing.T) {
	ctx := context.Background()

	assert.True(t, IsCurrentHostAssets(ctx, "assets/foo.png"), "a relative assets/ path must still be recognized")
	assert.False(t, IsCurrentHostAssets(ctx, "https://some-external-host.com/whatever"), "an arbitrary absolute URL must not be recognized when no host is configured")
}

// TestReplaceIDsInPlace is a regression test for SCA-05: nlslayer.go, style.go, and scene.go
// each used to call bytes.Replace once per imported item, and bytes.Replace always allocates
// and copies the whole buffer even for one small match -- so an import's total memory traffic
// scaled with item count * buffer size. This confirms replaceIDsInPlace applies every old/new ID
// pair correctly in a single pass, with no leftover old IDs and no cross-contamination between
// pairs.
func TestReplaceIDsInPlace(t *testing.T) {
	t.Run("replaces multiple pairs correctly", func(t *testing.T) {
		data := []byte(`{"layers":[{"id":"old-1","ref":"old-1"},{"id":"old-2","ref":"old-2"},{"id":"old-3","ref":"old-3"}]}`)
		replaceIDsInPlace(&data, []string{
			"old-1", "new-1",
			"old-2", "new-2",
			"old-3", "new-3",
		})

		s := string(data)
		assert.NotContains(t, s, "old-1")
		assert.NotContains(t, s, "old-2")
		assert.NotContains(t, s, "old-3")
		assert.Equal(t, `{"layers":[{"id":"new-1","ref":"new-1"},{"id":"new-2","ref":"new-2"},{"id":"new-3","ref":"new-3"}]}`, s)
	})

	t.Run("no-op on an empty pair list", func(t *testing.T) {
		data := []byte(`{"id":"old-1"}`)
		replaceIDsInPlace(&data, nil)
		assert.Equal(t, `{"id":"old-1"}`, string(data))
	})

	t.Run("a new ID is not itself replaced by a later pair", func(t *testing.T) {
		// If pair order or overlap were handled incorrectly, replacing "a"->"b" then "b"->"c"
		// could cascade and turn the first replacement's own output into "c".
		data := []byte(`{"id":"a"}`)
		replaceIDsInPlace(&data, []string{"a", "b", "b", "c"})
		assert.Equal(t, `{"id":"b"}`, string(data))
	})

	t.Run("panics on an odd-length pair list", func(t *testing.T) {
		data := []byte(`{"id":"a"}`)
		assert.Panics(t, func() {
			replaceIDsInPlace(&data, []string{"a"})
		})
	})
}
