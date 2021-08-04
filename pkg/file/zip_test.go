package file

import (
	"io"
	"testing"

	"github.com/stretchr/testify/assert"
)

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
