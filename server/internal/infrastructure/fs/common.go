package fs

import "github.com/reearth/reearth/server/pkg/id"

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
