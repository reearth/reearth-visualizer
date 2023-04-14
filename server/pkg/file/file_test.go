package file

import (
	"io"
	"os"
	"path/filepath"
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestReaders(t *testing.T) {
	zf, err := os.Open("testdata/test.zip")
	assert.NoError(t, err)
	defer func() {
		_ = zf.Close()
	}()
	zr, err := ZipReaderFrom(zf, 1024)
	assert.NoError(t, err)

	tf, err := os.Open("testdata/test.tar.gz")
	assert.NoError(t, err)
	defer func() {
		_ = tf.Close()
	}()
	tr, err := TarReaderFromTarGz(tf)
	assert.NoError(t, err)

	files := map[string]string{
		"reearth.json": "{\n  \"reearth\": \"Re:Earth\"\n}\n",
		"index.js":     "console.log(\"hello world\");\n",
		"test/foo.bar": "test\n",
	}

	tests := []struct {
		Name    string
		Archive Iterator
		Files   []string
	}{
		{
			Name:    "zip",
			Archive: zr,
			Files:   []string{"test/foo.bar", "index.js", "reearth.json"},
		},
		{
			Name:    "tar",
			Archive: tr,
			Files:   []string{"test/foo.bar", "index.js", "reearth.json"},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			// t.Parallel() cannot be used
			assert := assert.New(t)

			for i, f := range tc.Files {
				n, err := tc.Archive.Next()
				assert.NoError(err)
				assert.Equal(f, n.Path, "file %d in %s", i, tc.Name)
				assert.Equal(int64(len(files[f])), n.Size, "file %d in %s", i, tc.Name)
				assert.Equal("", n.ContentType, "file %d in %s", i, tc.Name)

				fc, err := io.ReadAll(n.Content)
				assert.NoError(err)
				assert.Equal(files[f], string(fc))

				assert.NoError(n.Content.Close())
			}

			n, err := tc.Archive.Next()
			assert.Nil(err)
			assert.Nil(n)

			n, err = tc.Archive.Next()
			assert.Nil(err)
			assert.Nil(n)
		})
	}
}

func TestSimpleIterator(t *testing.T) {
	a := NewSimpleIterator([]File{{Path: "a"}, {Path: "b"}, {Path: "c"}})

	n, err := a.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "a"}, n)

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "b"}, n)

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "c"}, n)

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Nil(t, n)

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Nil(t, n)
}

func TestPrefixIterator(t *testing.T) {
	ba := NewSimpleIterator([]File{
		{Path: "a"}, {Path: "b"}, {Path: "c/d"}, {Path: "e"}, {Path: "f/g/h"}, {Path: "c/i/j"},
	})
	a := NewPrefixIterator(ba, "c")

	n, err := a.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "d"}, n)

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "i/j"}, n)

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Nil(t, n)

	ba2 := NewSimpleIterator([]File{
		{Path: "a"}, {Path: "b"},
	})
	a2 := NewPrefixIterator(ba2, "")

	n2, err := a2.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "a"}, n2)

	n2, err = a2.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "b"}, n2)

	n2, err = a2.Next()
	assert.NoError(t, err)
	assert.Nil(t, n2)
}

func TestFilteredIterator(t *testing.T) {
	var paths []string
	ba := NewSimpleIterator([]File{
		{Path: "0"}, {Path: "1"}, {Path: "2"},
	})
	a := NewFilteredIterator(ba, func(p string) bool {
		paths = append(paths, p)
		return p == "1"
	})

	n, err := a.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "0"}, n)

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Equal(t, &File{Path: "2"}, n)

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Nil(t, n)
	assert.Equal(t, []string{"0", "1", "2"}, paths)
}

func TestFsIterator(t *testing.T) {
	fs := afero.NewMemMapFs()
	_ = fs.MkdirAll(filepath.Join("a", "b"), 0755)
	f, _ := fs.Create("b")
	_, _ = f.WriteString("hello")
	_ = f.Close()
	_, _ = fs.Create(filepath.Join("a", "b", "c"))

	a, err := NewFsIterator(fs)
	assert.NoError(t, err)

	n, err := a.Next()
	assert.NoError(t, err)
	assert.Equal(t, filepath.Join("a", "b", "c"), n.Path)
	nd, err := io.ReadAll(n.Content)
	assert.NoError(t, err)
	assert.Equal(t, []byte{}, nd)
	assert.NoError(t, n.Content.Close())

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Equal(t, "b", n.Path)
	nd, err = io.ReadAll(n.Content)
	assert.NoError(t, err)
	assert.Equal(t, "hello", string(nd))
	assert.NoError(t, n.Content.Close())

	n, err = a.Next()
	assert.NoError(t, err)
	assert.Nil(t, n)
}
