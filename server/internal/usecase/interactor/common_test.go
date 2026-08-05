package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/stretchr/testify/assert"
)

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
}
