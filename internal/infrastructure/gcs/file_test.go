package gcs

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetGCSObjectURL(t *testing.T) {
	e, err := url.Parse("https://hoge.com/assets/xxx.yyy")
	assert.NoError(t, err)
	b, err := url.Parse("https://hoge.com/assets")
	assert.NoError(t, err)
	assert.Equal(t, e, getGCSObjectURL(b, "xxx.yyy"))
}

func TestGetGCSObjectNameFromURL(t *testing.T) {
	u, err := url.Parse("https://hoge.com/assets/xxx.yyy")
	assert.NoError(t, err)
	b, err := url.Parse("https://hoge.com")
	assert.NoError(t, err)
	assert.Equal(t, "assets/xxx.yyy", getGCSObjectNameFromURL(b, u))
}
