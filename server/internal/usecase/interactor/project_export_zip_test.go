package interactor

import (
	"archive/zip"
	"bytes"
	"context"
	"io"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// countingFile is a minimal gateway.File stub that only implements ReadAsset, counting how
// many times each asset name is actually read. The embedded nil gateway.File satisfies every
// other method by promotion; calling one would panic on the nil interface, so a test relying
// on an unimplemented method fails loudly instead of silently doing nothing.
type countingFile struct {
	gateway.File
	reads   map[string]int
	content []byte
}

func (f *countingFile) ReadAsset(_ context.Context, name string) (io.ReadCloser, error) {
	f.reads[name]++
	return io.NopCloser(bytes.NewReader(f.content)), nil
}

// TestAddZipAsset_Dedup is a regression test for SCA-01: a scene referencing the same asset
// across many layers used to download and re-append it once per reference, ballooning memory
// and GCS reads for no reason. This confirms the fix: the asset is read and written exactly
// once, no matter how many times SearchAssetURL encounters its URL.
func TestAddZipAsset_Dedup(t *testing.T) {
	// IsCurrentHostAssets requires the URL to start with both "assets/" and the current host,
	// so with no host attached (CurrentHost defaults to ""), a bare "assets/..." path satisfies
	// both -- matching how AddZipAsset actually gates which URLs it treats as assets.
	ctx := context.Background()

	f := &countingFile{reads: map[string]int{}, content: []byte("asset-bytes")}
	assetRepo := memory.NewAsset()

	buf := &bytes.Buffer{}
	zipWriter := zip.NewWriter(buf)

	assetURL := "assets/shared-texture.png"

	// Same asset URL referenced by 100 different "layers".
	refs := make([]any, 0, 100)
	for range 100 {
		refs = append(refs, map[string]any{"texture": assetURL})
	}
	sceneData := map[string]any{"layers": refs}

	state := newExportZipState()
	require.NoError(t, SearchAssetURL(ctx, sceneData, assetRepo, f, zipWriter, state))
	require.NoError(t, zipWriter.Close())

	assert.Equal(t, 1, f.reads["shared-texture.png"], "the same asset must be read from storage exactly once, not once per reference")

	zr, err := zip.NewReader(bytes.NewReader(buf.Bytes()), int64(buf.Len()))
	require.NoError(t, err)
	assert.Len(t, zr.File, 1, "the zip must contain exactly one entry for the deduplicated asset")
}

// TestExportZipState_TrackWrite is a regression test for SCA-01's other half: the 500MB guard
// used to only run after the whole zip had already been written (zipWriter.Close(), then a
// seek-and-check on the finished file). This confirms the budget is now enforced as a running
// total that aborts as soon as it's exceeded, not after the fact.
func TestExportZipState_TrackWrite(t *testing.T) {
	state := newExportZipState()

	require.NoError(t, state.trackWrite(maxExportZipBytes-100))
	require.NoError(t, state.trackWrite(50)) // still under budget

	err := state.trackWrite(100) // now over budget
	require.Error(t, err)
	assert.Contains(t, err.Error(), "exceeds maximum allowed size")
}
