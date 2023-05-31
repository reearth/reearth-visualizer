package fs

import (
	"context"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestNewFile(t *testing.T) {
	f, err := NewFile(mockFs(), "")
	assert.NoError(t, err)
	assert.NotNil(t, f)
}

func TestFile_ReadAsset(t *testing.T) {
	f, _ := NewFile(mockFs(), "")

	r, err := f.ReadAsset(context.Background(), "xxx.txt")
	assert.NoError(t, err)
	c, err := io.ReadAll(r)
	assert.NoError(t, err)
	assert.Equal(t, "hello", string(c))
	assert.NoError(t, r.Close())

	r, err = f.ReadAsset(context.Background(), "aaa.txt")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)

	r, err = f.ReadAsset(context.Background(), "../published/s.json")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)
}

func TestFile_UploadAsset(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "https://example.com/assets")

	u, s, err := f.UploadAsset(context.Background(), &file.File{
		Path:    "aaa.txt",
		Content: io.NopCloser(strings.NewReader("aaa")),
	})
	assert.NoError(t, err)
	assert.Equal(t, int64(3), s)
	assert.Equal(t, "https", u.Scheme)
	assert.Equal(t, "example.com", u.Host)
	assert.True(t, strings.HasPrefix(u.Path, "/assets/"))
	assert.Equal(t, ".txt", filepath.Ext(u.Path))

	uf, _ := fs.Open(filepath.Join("assets", filepath.Base(u.Path)))
	c, _ := io.ReadAll(uf)
	assert.Equal(t, "aaa", string(c))
}

func TestFile_RemoveAsset(t *testing.T) {
	cases := []struct {
		Name    string
		URL     string
		Deleted bool
		Err     error
	}{
		{
			Name:    "deleted",
			URL:     "https://example.com/assets/xxx.txt",
			Deleted: true,
		},
		{
			Name: "not deleted 1",
			URL:  "https://example.com/assets/aaa.txt",
			Err:  nil,
		},
		{
			Name: "not deleted 2",
			URL:  "https://example.com/plugins/xxx.txt",
			Err:  gateway.ErrInvalidFile,
		},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			fs := mockFs()
			f, _ := NewFile(fs, "https://example.com/assets")

			u, _ := url.Parse(tc.URL)
			err := f.RemoveAsset(context.Background(), u)

			if tc.Err == nil {
				assert.NoError(t, err)
			} else {
				assert.Same(t, tc.Err, err)
			}

			_, err = fs.Stat(filepath.Join("assets", "xxx.txt"))
			if tc.Deleted {
				assert.ErrorIs(t, err, os.ErrNotExist)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestFile_ReadPluginFile(t *testing.T) {
	f, _ := NewFile(mockFs(), "")

	r, err := f.ReadPluginFile(context.Background(), id.MustPluginID("aaa~1.0.0"), "foo.js")
	assert.NoError(t, err)
	c, err := io.ReadAll(r)
	assert.NoError(t, err)
	assert.Equal(t, "bar", string(c))
	assert.NoError(t, r.Close())

	r, err = f.ReadPluginFile(context.Background(), id.MustPluginID("aaa~1.0.0"), "aaa.txt")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)

	r, err = f.ReadPluginFile(context.Background(), id.MustPluginID("aaa~1.0.1"), "foo.js")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)

	r, err = f.ReadPluginFile(context.Background(), id.MustPluginID("aaa~1.0.1"), "../../assets/xxx.txt")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)
}

func TestFile_UploadPluginFile(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "")

	err := f.UploadPluginFile(context.Background(), id.MustPluginID("aaa~1.0.1"), &file.File{
		Path:    "aaa.js",
		Content: io.NopCloser(strings.NewReader("aaa")),
	})
	assert.NoError(t, err)

	uf, _ := fs.Open(filepath.Join("plugins", "aaa~1.0.1", "aaa.js"))
	c, _ := io.ReadAll(uf)
	assert.Equal(t, "aaa", string(c))
}

func TestFile_RemovePluginFile(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "")

	err := f.RemovePlugin(context.Background(), id.MustPluginID("aaa~1.0.1"))
	assert.NoError(t, err)

	_, err = fs.Stat(filepath.Join("plugins", "aaa~1.0.0"))
	assert.NoError(t, err)

	err = f.RemovePlugin(context.Background(), id.MustPluginID("aaa~1.0.0"))
	assert.NoError(t, err)

	_, err = fs.Stat(filepath.Join("plugins", "aaa~1.0.0"))
	assert.ErrorIs(t, err, os.ErrNotExist)
}

func TestFile_ReadBuiltSceneFile(t *testing.T) {
	f, _ := NewFile(mockFs(), "")

	r, err := f.ReadBuiltSceneFile(context.Background(), "s")
	assert.NoError(t, err)
	c, err := io.ReadAll(r)
	assert.NoError(t, err)
	assert.Equal(t, "{}", string(c))
	assert.NoError(t, r.Close())

	r, err = f.ReadBuiltSceneFile(context.Background(), "a")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)

	r, err = f.ReadBuiltSceneFile(context.Background(), "../assets/xxx.txt")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)
}

func TestFile_UploadBuiltScene(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "")

	err := f.UploadBuiltScene(context.Background(), io.NopCloser(strings.NewReader("{\"aaa\":1}")), "a")
	assert.NoError(t, err)

	uf, _ := fs.Open(filepath.Join("published", "a.json"))
	c, _ := io.ReadAll(uf)
	assert.Equal(t, "{\"aaa\":1}", string(c))
}

func TestFile_MoveBuiltScene(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "")

	uf, _ := fs.Open(filepath.Join("published", "s.json"))
	c, _ := io.ReadAll(uf)
	assert.Equal(t, "{}", string(c))

	uf, err := fs.Open(filepath.Join("published", "a.json"))
	assert.ErrorIs(t, err, os.ErrNotExist)
	assert.Nil(t, uf)

	err = f.MoveBuiltScene(context.Background(), "s", "a")
	assert.NoError(t, err)

	uf, err = fs.Open(filepath.Join("published", "s.json"))
	assert.ErrorIs(t, err, os.ErrNotExist)
	assert.Nil(t, uf)

	uf, _ = fs.Open(filepath.Join("published", "a.json"))
	c, _ = io.ReadAll(uf)
	assert.Equal(t, "{}", string(c))
}

func TestFile_RemoveBuiltScene(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "")

	err := f.RemoveBuiltScene(context.Background(), "a")
	assert.NoError(t, err)

	_, err = fs.Stat(filepath.Join("published", "s.json"))
	assert.NoError(t, err)

	err = f.RemoveBuiltScene(context.Background(), "s")
	assert.NoError(t, err)

	_, err = fs.Stat(filepath.Join("published", "s.json"))
	assert.ErrorIs(t, err, os.ErrNotExist)
}

func TestGetAssetFileURL(t *testing.T) {
	e, err := url.Parse("http://hoge.com/assets/xxx.yyy")
	assert.NoError(t, err)
	b, err := url.Parse("http://hoge.com/assets")
	assert.NoError(t, err)
	assert.Equal(t, e, getAssetFileURL(b, "xxx.yyy"))
}

func mockFs() afero.Fs {
	files := map[string]string{
		filepath.Join("assets", "xxx.txt"):              "hello",
		filepath.Join("plugins", "aaa~1.0.0", "foo.js"): "bar",
		filepath.Join("published", "s.json"):            "{}",
	}

	fs := afero.NewMemMapFs()
	for name, content := range files {
		f, _ := fs.Create(name)
		_, _ = f.WriteString(content)
		_ = f.Close()
	}
	return fs
}
