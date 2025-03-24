package builtin

import (
	_ "embed"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/plugin/manifest"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/visualizer"
)

//go:embed manifest.yml
var pluginManifestJSON []byte

//go:embed manifest_ja.yml
var pluginManifestJSON_ja []byte

var pluginTranslationList = manifest.TranslationMap{
	"ja": manifest.MustParseTranslationFromBytes(pluginManifestJSON_ja),
}
var pluginManifest = manifest.MustParseSystemFromBytes(pluginManifestJSON, nil, pluginTranslationList.TranslatedRef())

// MUST NOT CHANGE
var (
	PropertySchemaIDVisualizerCesium     = id.MustPropertySchemaID("reearth/cesium")
	PropertySchemaIDVisualizerBetaCesium = id.MustPropertySchemaID("reearth/cesium-beta")
	PropertySchemaIDInfobox              = id.MustPropertySchemaID("reearth/infobox")
	PropertySchemaIDBetaInfobox          = id.MustPropertySchemaID("reearth/infobox-beta")
	PropertySchemaIDPhotoOverlay         = id.MustPropertySchemaID("reearth/photo-overlay")
	PropertySchemaIDInfoboxBlock         = id.MustPropertySchemaID("reearth/infoboxBlock")
	PropertySchemaIDStory                = id.MustPropertySchemaID("reearth/story")
	PropertySchemaIDStoryPage            = id.MustPropertySchemaID("reearth/storyPage")
	PropertySchemaIDStoryBlock           = id.MustPropertySchemaID("reearth/storyBlock")
)

func GetPropertySchemaByVisualizer(v visualizer.Visualizer) *property.Schema {
	for _, p := range pluginManifest.ExtensionSchema {
		if p.ID().String() == "reearth/"+string(v) {
			return p
		}
	}
	return nil
}

func MustPropertySchemaByVisualizer(v visualizer.Visualizer) *property.Schema {
	ps := GetPropertySchemaByVisualizer(v)
	if ps == nil {
		panic("property schema not found: " + v)
	}
	return ps
}

func GetPropertySchema(id id.PropertySchemaID) *property.Schema {
	for _, p := range pluginManifest.ExtensionSchema {
		if id == p.ID() {
			return p
		}
	}
	return nil
}

func Plugin() *plugin.Plugin {
	return pluginManifest.Plugin
}

func GetPlugin(id id.PluginID) *plugin.Plugin {
	if id.Equal(pluginManifest.Plugin.ID()) {
		return pluginManifest.Plugin
	}
	return nil
}
