package builtin

import (
	_ "embed"

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
	PropertySchemaIDVisualizerCesium     = property.MustSchemaID("reearth/cesium")
	PropertySchemaIDVisualizerBetaCesium = property.MustSchemaID("reearth/cesium-beta")
	PropertySchemaIDInfobox              = property.MustSchemaID("reearth/infobox")
	PropertySchemaIDBetaInfobox          = property.MustSchemaID("reearth/infobox-beta")
	PropertySchemaIDInfoboxBlock         = property.MustSchemaID("reearth/infoboxBlock")
	PropertySchemaIDStory                = property.MustSchemaID("reearth/story")
	PropertySchemaIDStoryPage            = property.MustSchemaID("reearth/storyPage")
	PropertySchemaIDStoryBlock           = property.MustSchemaID("reearth/storyBlock")
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

func GetPropertySchema(id property.SchemaID) *property.Schema {
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

func GetPlugin(id plugin.ID) *plugin.Plugin {
	if id.Equal(pluginManifest.Plugin.ID()) {
		return pluginManifest.Plugin
	}
	return nil
}
