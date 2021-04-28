package fs

import (
	"net/url"
	"path"
	"strings"

	"github.com/reearth/reearth-backend/pkg/id"
)

const (
	manifestFilePath = "reearth.json"
	assetDir         = "assets"
	pluginDir        = "plugins"
	publishedDir     = "published"
)

func getPluginFilePath(base string, pluginID id.PluginID, filename string) string {
	return path.Join(base, pluginDir, pluginID.Name(), pluginID.Version().String(), filename)
}

func getAssetFilePath(base string, filename string) string {
	return path.Join(base, assetDir, filename)
}

func getPublishedDataFilePath(base, name string) string {
	return path.Join(base, publishedDir, name+".json")
}

func getAssetFileURL(base *url.URL, filename string) *url.URL {
	if base == nil {
		return nil
	}

	b := *base
	b.Path = path.Join(b.Path, filename)
	return &b
}

func getAssetFilePathFromURL(base string, u *url.URL) string {
	if u == nil {
		return ""
	}
	p := strings.Split(u.Path, "/")
	if len(p) == 0 {
		return ""
	}
	f := p[len(p)-1]
	return getAssetFilePath(base, f)
}
