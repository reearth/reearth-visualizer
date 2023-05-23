package storage

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_getObjectNameFromURL(t *testing.T) {
	u, _ := url.Parse("https://hoge.com/assets/xxx.yyy")
	b, _ := url.Parse("https://hoge.com")
	b2, _ := url.Parse("https://hoge2.com")
	assert.Equal(t, "assets/xxx.yyy", getObjectNameFromURL(b, u))
	assert.Equal(t, "", getObjectNameFromURL(b2, u))
	assert.Equal(t, "", getObjectNameFromURL(nil, u))
	assert.Equal(t, "", getObjectNameFromURL(b, nil))
}

func Test_getObjectURL(t *testing.T) {
	e, _ := url.Parse("https://hoge.com/assets/xxx.yyy")
	b, _ := url.Parse("https://hoge.com/assets")
	assert.Equal(t, e, getObjectURL(b, "xxx.yyy"))
}

func Test_newAssetID(t *testing.T) {
	assert.NotEqual(t, "", newAssetID())
}
