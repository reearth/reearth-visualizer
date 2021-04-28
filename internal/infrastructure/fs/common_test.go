package fs

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetAssetFileURL(t *testing.T) {
	e, err := url.Parse("http://hoge.com/assets/xxx.yyy")
	assert.NoError(t, err)
	b, err := url.Parse("http://hoge.com/assets")
	assert.NoError(t, err)
	assert.Equal(t, e, getAssetFileURL(b, "xxx.yyy"))
}

func TestGetAssetFilePathFromURL(t *testing.T) {
	u, err := url.Parse("http://hoge.com/assets/xxx.yyy")
	assert.NoError(t, err)
	assert.Equal(t, "a/assets/xxx.yyy", getAssetFilePathFromURL("a", u))
}
