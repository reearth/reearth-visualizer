package interactor

import (
	"archive/zip"
	"bytes"
	"context"
	"errors"
	"io"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/spf13/afero"
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

func (f *countingFile) UploadExportProjectZip(context.Context, afero.File) error {
	return nil
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

// flakyFile fails the first ReadAsset call for a given process, then succeeds on later calls.
type flakyFile struct {
	gateway.File
	calls   int
	content []byte
}

func (f *flakyFile) ReadAsset(_ context.Context, _ string) (io.ReadCloser, error) {
	f.calls++
	if f.calls == 1 {
		return nil, errors.New("transient storage error")
	}
	return io.NopCloser(bytes.NewReader(f.content)), nil
}

// TestAddZipAsset_TransientReadErrorDoesNotBlockRetry is a regression test: state.seen used to be
// marked true before confirming the read succeeded, so a transient storage error on an asset's
// first reference permanently skipped every later reference to the same URL within the export.
// This confirms a failed read is not deduplicated, so a later reference gets a fresh attempt.
func TestAddZipAsset_TransientReadErrorDoesNotBlockRetry(t *testing.T) {
	ctx := context.Background()
	f := &flakyFile{content: []byte("asset-bytes")}
	assetRepo := memory.NewAsset()
	buf := &bytes.Buffer{}
	zipWriter := zip.NewWriter(buf)
	state := newExportZipState()
	assetURL := "assets/retry-me.png"

	require.NoError(t, AddZipAsset(ctx, assetRepo, f, zipWriter, assetURL, state)) // read fails, swallowed
	require.NoError(t, AddZipAsset(ctx, assetRepo, f, zipWriter, assetURL, state)) // read succeeds
	require.NoError(t, zipWriter.Close())

	assert.Equal(t, 2, f.calls, "a failed read must not mark the asset as seen, so a later reference retries")

	zr, err := zip.NewReader(bytes.NewReader(buf.Bytes()), int64(buf.Len()))
	require.NoError(t, err)
	assert.Len(t, zr.File, 1, "the asset should end up in the zip once a read finally succeeds")
}

// TestBudgetedWriter_AbortsMidWrite is a regression test: the byte budget used to only be checked
// once after io.Copy fully finished, so a single oversized asset would be entirely copied into the
// zip before being rejected. This confirms a write that would cross the budget is rejected before
// any of its bytes reach the underlying writer.
func TestBudgetedWriter_AbortsMidWrite(t *testing.T) {
	state := newExportZipState()
	state.written = maxExportZipBytes - 10

	var dest bytes.Buffer
	w := &budgetedWriter{w: &dest, state: state}

	n, err := w.Write(bytes.Repeat([]byte("x"), 20))
	require.Error(t, err)
	assert.Contains(t, err.Error(), "exceeds maximum allowed size")
	assert.Equal(t, 0, n)
	assert.Equal(t, 0, dest.Len(), "no bytes should reach the underlying writer once the budget is exceeded")
}

// TestSaveExportProjectZip_ManifestCountsTowardBudget is a regression test: project.json's own
// bytes used to never be tracked, so a large manifest could bypass the export size cap entirely.
// This confirms writing the manifest is itself subject to the running budget.
func TestSaveExportProjectZip_ManifestCountsTowardBudget(t *testing.T) {
	original := maxExportZipBytes
	maxExportZipBytes = 10 // smaller than any real manifest, so project.json alone trips it
	defer func() { maxExportZipBytes = original }()

	ctx := context.Background()
	i := &Project{assetRepo: memory.NewAsset(), file: &countingFile{reads: map[string]int{}}}

	buf := &bytes.Buffer{}
	zipWriter := zip.NewWriter(buf)
	zipFile, err := afero.TempFile(afero.NewMemMapFs(), "", "export-*.zip")
	require.NoError(t, err)

	err = i.SaveExportProjectZip(ctx, zipWriter, zipFile, map[string]interface{}{"project": map[string]interface{}{}}, nil)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "exceeds maximum allowed size")
}
