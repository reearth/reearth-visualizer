package app

import (
	"testing"

	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestRewriteHTML(t *testing.T) {
	html := `<head><title>XXX</title><meta charset="utf8" /><link rel="icon" href="aaa" /></head>`
	assert.Equal(t, `<head><title>hoge</title><meta charset="utf8" /><link rel="icon" href="favicon" /></head>`, rewriteHTML(html, "hoge", "favicon"))
}

func TestAdapterFS(t *testing.T) {
	fs1 := afero.NewMemMapFs()
	_ = afero.WriteFile(fs1, "aaaa", []byte("aaa"), 0666)
	fs2 := afero.NewMemMapFs()
	_ = afero.WriteFile(fs2, "aaaa", []byte("xxx"), 0666)
	_ = afero.WriteFile(fs2, "bbbb", []byte("bbb"), 0666)

	a := &AdapterFS{
		FSU: fs1,
		FS:  fs2,
	}

	d, err := afero.ReadFile(a, "aaaa")
	assert.NoError(t, err)
	assert.Equal(t, "aaa", string(d))

	d, err = afero.ReadFile(a, "bbbb")
	assert.NoError(t, err)
	assert.Equal(t, "bbb", string(d))

	d, err = afero.ReadFile(a, "ccc")
	assert.ErrorContains(t, err, "file does not exist")
	assert.Nil(t, d)
}
