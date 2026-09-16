package file

import (
	"io"
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestNewExportZipScratchFile_ConcurrentExportsOfSameProjectDoNotCollide is a regression test for
// SCA-05: two concurrent exports of the same project used to both fs.Create the same fixed
// "<projectID>.zip" local scratch path, so the second export's create truncated the file the
// first export was still streaming assets into, and the first export's deferred os.Remove then
// deleted the second export's file out from under it. This confirms two scratch files requested
// for the same project ID are distinct, independently writable files, while the object name each
// should be uploaded/served as stays the same deterministic "<projectID>.zip".
func TestNewExportZipScratchFile_ConcurrentExportsOfSameProjectDoNotCollide(t *testing.T) {
	fs := afero.NewMemMapFs()
	const projectID = "01hzzzzzzzzzzzzzzzzzzzzzzz"

	first, firstObjectName, err := NewExportZipScratchFile(fs, projectID)
	require.NoError(t, err)
	second, secondObjectName, err := NewExportZipScratchFile(fs, projectID)
	require.NoError(t, err)

	assert.Equal(t, projectID+".zip", firstObjectName, "the served/uploaded object name must stay the deterministic <projectID>.zip")
	assert.Equal(t, firstObjectName, secondObjectName, "both concurrent exports of the same project upload to the same object name")
	assert.NotEqual(t, first.Name(), second.Name(), "concurrent exports of the same project must not share a local scratch file")

	_, err = first.Write([]byte("first export's bytes"))
	require.NoError(t, err)
	_, err = second.Write([]byte("second export's bytes, much longer than the first"))
	require.NoError(t, err)

	require.NoError(t, second.Close())
	require.NoError(t, fs.Remove(second.Name())) // simulates the second export's deferred os.Remove

	// The first export's file and its in-progress content must be untouched by the second
	// export's close and remove, which is exactly the corruption this fix prevents.
	_, err = first.Seek(0, io.SeekStart)
	require.NoError(t, err)
	b, err := io.ReadAll(first)
	require.NoError(t, err)
	assert.Equal(t, "first export's bytes", string(b))
}

func TestMockZipReader(t *testing.T) {
	z := MockZipReader([]string{"a", "b", "c/", "c/d"})
	assert.Equal(t, "a", z.File[0].Name)
	assert.Equal(t, "b", z.File[1].Name)
	assert.Equal(t, "c/", z.File[2].Name)
	assert.Equal(t, "c/d", z.File[3].Name)

	for _, f := range []string{"a", "b", "c/d"} {
		zf, err := z.Open(f)
		assert.NoError(t, err)
		b, err := io.ReadAll(zf)
		assert.NoError(t, err)
		assert.Equal(t, []byte{}, b)
		assert.NoError(t, zf.Close())
	}
}

func TestZipBasePath(t *testing.T) {
	assert.Equal(t, "aaa", ZipBasePath(MockZipReader([]string{"aaa/", "aaa/a"})))
	assert.Equal(t, "", ZipBasePath(MockZipReader([]string{"aaa/", "aaa/a", "b"})))
	assert.Equal(t, "", ZipBasePath(MockZipReader([]string{"aaa"})))
	assert.Equal(t, "", ZipBasePath(MockZipReader([]string{"aaa/", "aaa/a", "b/", "b/c"})))
}
