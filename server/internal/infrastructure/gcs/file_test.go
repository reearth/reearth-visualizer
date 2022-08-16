package gcs

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetGCSObjectURL(t *testing.T) {
	e, _ := url.Parse("https://hoge.com/assets/xxx.yyy")
	b, _ := url.Parse("https://hoge.com/assets")
	assert.Equal(t, e, getGCSObjectURL(b, "xxx.yyy"))
}

func TestGetGCSObjectNameFromURL(t *testing.T) {
	u, _ := url.Parse("https://hoge.com/assets/xxx.yyy")
	b, _ := url.Parse("https://hoge.com")
	b2, _ := url.Parse("https://hoge2.com")
	assert.Equal(t, "assets/xxx.yyy", getGCSObjectNameFromURL(b, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(b2, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(nil, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(b, nil))
}
