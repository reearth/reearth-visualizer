package storage

import (
	"net/url"
	"path"
	"strings"

	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth/server/pkg/id"
)

const (
	assetDir         = "assets"
	pluginDir        = "plugins"
	publishedDir     = "published"
	manifestFilePath = "reearth.yml"
)

func newAssetID() string {
	// TODO: replace
	return id.NewAssetID().String()
}

func getObjectURL(base *url.URL, objectName string) *url.URL {
	if base == nil {
		return nil
	}

	// https://github.com/golang/go/issues/38351
	b := *base
	b.Path = path.Join(b.Path, objectName)
	return &b
}

func getObjectNameFromURL(base, u *url.URL) string {
	if u == nil {
		return ""
	}
	if base == nil {
		base = &url.URL{}
	}
	p := sanitize.Path(strings.TrimPrefix(u.Path, "/"))
	if p == "" || u.Host != base.Host || u.Scheme != base.Scheme || !strings.HasPrefix(p, gcsAssetBasePath+"/") {
		return ""
	}

	return p
}
