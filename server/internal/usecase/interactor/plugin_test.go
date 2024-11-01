package interactor

import (
	// "context"
	// "encoding/json"
	"bytes"
	"context"
	"encoding/json"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestImportPlugins ./internal/usecase/interactor/...

func TestImportPlugins(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	ws := workspace.New().NewID().Policy(policy.ID("policy").Ref()).MustBuild()
	prj, _ := project.New().NewID().Workspace(ws.ID()).Build()
	_ = db.Project.Save(ctx, prj)
	sce, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).RootLayer(id.NewLayerID()).Build()
	_ = db.Scene.Save(ctx, sce)

	is := NewPlugin(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	pluginsJson := bytes.Replace(pluginsJson, []byte("01jaxywcjw38sv2v28e4hcbha8"), []byte(sce.ID().String()), -1)

	var pluginsData []interface{}
	err := json.Unmarshal(pluginsJson, &pluginsData)
	assert.NoError(t, err)

	var schemasData []interface{}
	err = json.Unmarshal(schemasJson, &schemasData)
	assert.NoError(t, err)

	// invoke the target function
	result, result2, err := is.ImportPlugins(ctx, sce, pluginsData, schemasData)
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.NotNil(t, result2)
}

var pluginsJson = []byte(`
[
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0",
        "sceneId": "01jaxywcjw38sv2v28e4hcbha8",
        "name": "Plugin Communication Demo",
        "version": "1.0.0",
        "description": "",
        "author": "",
        "repositoryUrl": "",
        "extensions": [
            {
                "extensionId": "widgetcomm",
                "pluginId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0",
                "type": "WIDGET",
                "name": "Communication Demo Widget",
                "description": "",
                "icon": "",
                "singleOnly": false,
                "propertySchemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0/widgetcomm",
                "allTranslatedName": {
                    "en": "Communication Demo Widget"
                },
                "translatedName": "",
                "translatedDescription": ""
            },
            {
                "extensionId": "blockcomm",
                "pluginId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0",
                "type": "BLOCK",
                "name": "Communication Demo Block",
                "description": "",
                "icon": "",
                "singleOnly": false,
                "propertySchemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0/blockcomm",
                "allTranslatedName": {
                    "en": "Communication Demo Block"
                },
                "translatedName": "",
                "translatedDescription": ""
            }
        ],
        "allTranslatedName": {
            "en": "Plugin Communication Demo"
        },
        "translatedName": "",
        "translatedDescription": ""
    },
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0",
        "sceneId": "01jaxywcjw38sv2v28e4hcbha8",
        "name": "Plugin Communication Demo for Beta",
        "version": "1.0.0",
        "description": "",
        "author": "",
        "repositoryUrl": "",
        "extensions": [
            {
                "extensionId": "widgetcomm",
                "pluginId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0",
                "type": "WIDGET",
                "name": "Communication Demo Widget",
                "description": "",
                "icon": "",
                "singleOnly": false,
                "propertySchemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
                "allTranslatedName": {
                    "en": "Communication Demo Widget"
                },
                "translatedName": "",
                "translatedDescription": ""
            },
            {
                "extensionId": "storyblockcomm",
                "pluginId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0",
                "type": "StoryBlock",
                "name": "Communication Demo Story Block",
                "description": "",
                "icon": "",
                "singleOnly": false,
                "propertySchemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
                "allTranslatedName": {
                    "en": "Communication Demo Story Block"
                },
                "translatedName": "",
                "translatedDescription": ""
            },
            {
                "extensionId": "infoboxblockcomm",
                "pluginId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0",
                "type": "InfoboxBlock",
                "name": "Communication Demo Infobox Block",
                "description": "",
                "icon": "",
                "singleOnly": false,
                "propertySchemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
                "allTranslatedName": {
                    "en": "Communication Demo Infobox Block"
                },
                "translatedName": "",
                "translatedDescription": ""
            }
        ],
        "allTranslatedName": {
            "en": "Plugin Communication Demo for Beta"
        },
        "translatedName": "",
        "translatedDescription": ""
    },
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-visualizer-plugin-welcome-page~1.0.0",
        "sceneId": "01jaxywcjw38sv2v28e4hcbha8",
        "name": "Visualizer Welcome Page Plugin",
        "version": "1.0.0",
        "description": "",
        "author": "",
        "repositoryUrl": "",
        "extensions": [
            {
                "extensionId": "welcome",
                "pluginId": "01jaxywcjw38sv2v28e4hcbha8~reearth-visualizer-plugin-welcome-page~1.0.0",
                "type": "WIDGET",
                "name": "Welcome Page",
                "description": "",
                "icon": "",
                "singleOnly": true,
                "widgetLayout": {
                    "extendable": {
                        "vertically": false,
                        "horizontally": false
                    },
                    "extended": false,
                    "floating": false,
                    "defaultLocation": {
                        "zone": "INNER",
                        "section": "CENTER",
                        "area": "TOP"
                    }
                },
                "propertySchemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-visualizer-plugin-welcome-page~1.0.0/welcome",
                "allTranslatedName": {
                    "en": "Welcome Page"
                },
                "translatedName": "",
                "translatedDescription": ""
            }
        ],
        "allTranslatedName": {
            "en": "Visualizer Welcome Page Plugin"
        },
        "translatedName": "",
        "translatedDescription": ""
    }
]
`)

var schemasJson = []byte(`
[
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0/widgetcomm",
        "groups": [],
        "linkableFields": {
            "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0/widgetcomm"
        }
    },
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0/blockcomm",
        "groups": [],
        "linkableFields": {
            "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo~1.0.0/blockcomm"
        }
    },
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
        "groups": [
            {
                "schemaGroupId": "page_settings",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
                "fields": [
                    {
                        "fieldId": "page_type",
                        "type": "STRING",
                        "title": "Page type",
                        "description": "",
                        "defaultValue": null,
                        "choices": [
                            {
                                "key": "welcome",
                                "title": "Welcome Page",
                                "allTranslatedTitle": {
                                    "en": "Welcome Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "markdown",
                                "title": "MD Content Page",
                                "allTranslatedTitle": {
                                    "en": "MD Content Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "tutorial",
                                "title": "Tutorial Page",
                                "allTranslatedTitle": {
                                    "en": "Tutorial Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "agreement",
                                "title": "Agreement Page",
                                "allTranslatedTitle": {
                                    "en": "Agreement Page"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Page type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_title",
                        "type": "STRING",
                        "title": "Title",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Title"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_description",
                        "type": "STRING",
                        "title": "Description",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Description"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_video_url",
                        "type": "URL",
                        "title": "Video url",
                        "description": "",
                        "defaultValue": null,
                        "ui": "FILE",
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Video url"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "markdown_content",
                        "type": "STRING",
                        "title": "MD Content",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "markdown"
                        },
                        "allTranslatedTitle": {
                            "en": "MD Content"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": true,
                "title": "Page Settings",
                "allTranslatedTitle": {
                    "en": "Page Settings"
                },
                "representativeFieldId": "page_type",
                "representativeField": {
                    "fieldId": "page_type",
                    "type": "STRING",
                    "title": "Page type",
                    "description": "",
                    "defaultValue": null,
                    "choices": [
                        {
                            "key": "welcome",
                            "title": "Welcome Page",
                            "allTranslatedTitle": {
                                "en": "Welcome Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "markdown",
                            "title": "MD Content Page",
                            "allTranslatedTitle": {
                                "en": "MD Content Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "tutorial",
                            "title": "Tutorial Page",
                            "allTranslatedTitle": {
                                "en": "Tutorial Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "agreement",
                            "title": "Agreement Page",
                            "allTranslatedTitle": {
                                "en": "Agreement Page"
                            },
                            "translatedTitle": ""
                        }
                    ],
                    "allTranslatedTitle": {
                        "en": "Page type"
                    },
                    "translatedTitle": "",
                    "translatedDescription": ""
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "appearance",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
                "fields": [
                    {
                        "fieldId": "primary_color",
                        "type": "STRING",
                        "title": "Primary color",
                        "description": "",
                        "defaultValue": null,
                        "ui": "COLOR",
                        "allTranslatedTitle": {
                            "en": "Primary color"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": false,
                "title": "Appearance",
                "allTranslatedTitle": {
                    "en": "Appearance"
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "available_if_test",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
                "fields": [
                    {
                        "fieldId": "test_type",
                        "type": "STRING",
                        "title": "Test type",
                        "description": "",
                        "defaultValue": null,
                        "choices": [
                            {
                                "key": "type_a",
                                "title": "A",
                                "allTranslatedTitle": {
                                    "en": "A"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "type_b",
                                "title": "B",
                                "allTranslatedTitle": {
                                    "en": "B"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Test type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "test_value_a",
                        "type": "STRING",
                        "title": "Value A",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "test_type",
                            "type": "STRING",
                            "value": "type_a"
                        },
                        "allTranslatedTitle": {
                            "en": "Value A"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "test_value_b",
                        "type": "STRING",
                        "title": "Value B",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "test_type",
                            "type": "STRING",
                            "value": "type_b"
                        },
                        "allTranslatedTitle": {
                            "en": "Value B"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": false,
                "title": "Avaliable If Test",
                "allTranslatedTitle": {
                    "en": "Avaliable If Test"
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "tiles",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
                "fields": [
                    {
                        "fieldId": "tile_type",
                        "type": "STRING",
                        "title": "Tile type",
                        "description": "",
                        "defaultValue": "default",
                        "choices": [
                            {
                                "key": "default",
                                "title": "Default",
                                "allTranslatedTitle": {
                                    "en": "Default"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "default_label",
                                "title": "Labelled",
                                "allTranslatedTitle": {
                                    "en": "Labelled"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "default_road",
                                "title": "Road Map",
                                "allTranslatedTitle": {
                                    "en": "Road Map"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "stamen_watercolor",
                                "title": "Stamen Watercolor",
                                "allTranslatedTitle": {
                                    "en": "Stamen Watercolor"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "stamen_toner",
                                "title": "Stamen Toner",
                                "allTranslatedTitle": {
                                    "en": "Stamen Toner"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "open_street_map",
                                "title": "OpenStreetMap",
                                "allTranslatedTitle": {
                                    "en": "OpenStreetMap"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "esri_world_topo",
                                "title": "ESRI Topography",
                                "allTranslatedTitle": {
                                    "en": "ESRI Topography"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "black_marble",
                                "title": "Earth at night",
                                "allTranslatedTitle": {
                                    "en": "Earth at night"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "japan_gsi_standard",
                                "title": "Japan GSI Standard Map",
                                "allTranslatedTitle": {
                                    "en": "Japan GSI Standard Map"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "url",
                                "title": "URL",
                                "allTranslatedTitle": {
                                    "en": "URL"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Tile type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_url",
                        "type": "STRING",
                        "title": "Tile map URL",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "tile_type",
                            "type": "STRING",
                            "value": "url"
                        },
                        "allTranslatedTitle": {
                            "en": "Tile map URL"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_minLevel",
                        "type": "NUMBER",
                        "title": "Minimum zoom level",
                        "description": "",
                        "defaultValue": null,
                        "min": 0,
                        "max": 30,
                        "allTranslatedTitle": {
                            "en": "Minimum zoom level"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_maxLevel",
                        "type": "NUMBER",
                        "title": "Maximum zoom level",
                        "description": "",
                        "defaultValue": null,
                        "min": 0,
                        "max": 30,
                        "allTranslatedTitle": {
                            "en": "Maximum zoom level"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_opacity",
                        "type": "NUMBER",
                        "title": "Opacity",
                        "description": "Change the opacity of the selected tile map. Min: 0 Max: 1",
                        "defaultValue": 1,
                        "ui": "SLIDER",
                        "min": 0,
                        "max": 1,
                        "allTranslatedTitle": {
                            "en": "Opacity"
                        },
                        "allTranslatedDescription": {
                            "en": "Change the opacity of the selected tile map. Min: 0 Max: 1"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": true,
                "title": "Tiles",
                "allTranslatedTitle": {
                    "en": "Tiles"
                },
                "representativeFieldId": "tile_type",
                "representativeField": {
                    "fieldId": "tile_type",
                    "type": "STRING",
                    "title": "Tile type",
                    "description": "",
                    "defaultValue": "default",
                    "choices": [
                        {
                            "key": "default",
                            "title": "Default",
                            "allTranslatedTitle": {
                                "en": "Default"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "default_label",
                            "title": "Labelled",
                            "allTranslatedTitle": {
                                "en": "Labelled"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "default_road",
                            "title": "Road Map",
                            "allTranslatedTitle": {
                                "en": "Road Map"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "stamen_watercolor",
                            "title": "Stamen Watercolor",
                            "allTranslatedTitle": {
                                "en": "Stamen Watercolor"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "stamen_toner",
                            "title": "Stamen Toner",
                            "allTranslatedTitle": {
                                "en": "Stamen Toner"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "open_street_map",
                            "title": "OpenStreetMap",
                            "allTranslatedTitle": {
                                "en": "OpenStreetMap"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "esri_world_topo",
                            "title": "ESRI Topography",
                            "allTranslatedTitle": {
                                "en": "ESRI Topography"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "black_marble",
                            "title": "Earth at night",
                            "allTranslatedTitle": {
                                "en": "Earth at night"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "japan_gsi_standard",
                            "title": "Japan GSI Standard Map",
                            "allTranslatedTitle": {
                                "en": "Japan GSI Standard Map"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "url",
                            "title": "URL",
                            "allTranslatedTitle": {
                                "en": "URL"
                            },
                            "translatedTitle": ""
                        }
                    ],
                    "allTranslatedTitle": {
                        "en": "Tile type"
                    },
                    "translatedTitle": "",
                    "translatedDescription": ""
                },
                "translatedTitle": ""
            }
        ],
        "linkableFields": {
            "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm"
        }
    },
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
        "groups": [
            {
                "schemaGroupId": "page_settings",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
                "fields": [
                    {
                        "fieldId": "page_type",
                        "type": "STRING",
                        "title": "Page type",
                        "description": "",
                        "defaultValue": null,
                        "choices": [
                            {
                                "key": "welcome",
                                "title": "Welcome Page",
                                "allTranslatedTitle": {
                                    "en": "Welcome Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "markdown",
                                "title": "MD Content Page",
                                "allTranslatedTitle": {
                                    "en": "MD Content Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "tutorial",
                                "title": "Tutorial Page",
                                "allTranslatedTitle": {
                                    "en": "Tutorial Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "agreement",
                                "title": "Agreement Page",
                                "allTranslatedTitle": {
                                    "en": "Agreement Page"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Page type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_title",
                        "type": "STRING",
                        "title": "Title",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Title"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_description",
                        "type": "STRING",
                        "title": "Description",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Description"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_video_url",
                        "type": "URL",
                        "title": "Video url",
                        "description": "",
                        "defaultValue": null,
                        "ui": "FILE",
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Video url"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "markdown_content",
                        "type": "STRING",
                        "title": "MD Content",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "markdown"
                        },
                        "allTranslatedTitle": {
                            "en": "MD Content"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": true,
                "title": "Page Settings",
                "allTranslatedTitle": {
                    "en": "Page Settings"
                },
                "representativeFieldId": "page_type",
                "representativeField": {
                    "fieldId": "page_type",
                    "type": "STRING",
                    "title": "Page type",
                    "description": "",
                    "defaultValue": null,
                    "choices": [
                        {
                            "key": "welcome",
                            "title": "Welcome Page",
                            "allTranslatedTitle": {
                                "en": "Welcome Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "markdown",
                            "title": "MD Content Page",
                            "allTranslatedTitle": {
                                "en": "MD Content Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "tutorial",
                            "title": "Tutorial Page",
                            "allTranslatedTitle": {
                                "en": "Tutorial Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "agreement",
                            "title": "Agreement Page",
                            "allTranslatedTitle": {
                                "en": "Agreement Page"
                            },
                            "translatedTitle": ""
                        }
                    ],
                    "allTranslatedTitle": {
                        "en": "Page type"
                    },
                    "translatedTitle": "",
                    "translatedDescription": ""
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "appearance",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
                "fields": [
                    {
                        "fieldId": "primary_color",
                        "type": "STRING",
                        "title": "Primary color",
                        "description": "",
                        "defaultValue": null,
                        "ui": "COLOR",
                        "allTranslatedTitle": {
                            "en": "Primary color"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": false,
                "title": "Appearance",
                "allTranslatedTitle": {
                    "en": "Appearance"
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "available_if_test",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
                "fields": [
                    {
                        "fieldId": "test_type",
                        "type": "STRING",
                        "title": "Test type",
                        "description": "",
                        "defaultValue": null,
                        "choices": [
                            {
                                "key": "type_a",
                                "title": "A",
                                "allTranslatedTitle": {
                                    "en": "A"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "type_b",
                                "title": "B",
                                "allTranslatedTitle": {
                                    "en": "B"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Test type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "test_value_a",
                        "type": "STRING",
                        "title": "Value A",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "test_type",
                            "type": "STRING",
                            "value": "type_a"
                        },
                        "allTranslatedTitle": {
                            "en": "Value A"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "test_value_b",
                        "type": "STRING",
                        "title": "Value B",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "test_type",
                            "type": "STRING",
                            "value": "type_b"
                        },
                        "allTranslatedTitle": {
                            "en": "Value B"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": false,
                "title": "Avaliable If Test",
                "allTranslatedTitle": {
                    "en": "Avaliable If Test"
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "tiles",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
                "fields": [
                    {
                        "fieldId": "tile_type",
                        "type": "STRING",
                        "title": "Tile type",
                        "description": "",
                        "defaultValue": "default",
                        "choices": [
                            {
                                "key": "default",
                                "title": "Default",
                                "allTranslatedTitle": {
                                    "en": "Default"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "default_label",
                                "title": "Labelled",
                                "allTranslatedTitle": {
                                    "en": "Labelled"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "default_road",
                                "title": "Road Map",
                                "allTranslatedTitle": {
                                    "en": "Road Map"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "stamen_watercolor",
                                "title": "Stamen Watercolor",
                                "allTranslatedTitle": {
                                    "en": "Stamen Watercolor"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "stamen_toner",
                                "title": "Stamen Toner",
                                "allTranslatedTitle": {
                                    "en": "Stamen Toner"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "open_street_map",
                                "title": "OpenStreetMap",
                                "allTranslatedTitle": {
                                    "en": "OpenStreetMap"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "esri_world_topo",
                                "title": "ESRI Topography",
                                "allTranslatedTitle": {
                                    "en": "ESRI Topography"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "black_marble",
                                "title": "Earth at night",
                                "allTranslatedTitle": {
                                    "en": "Earth at night"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "japan_gsi_standard",
                                "title": "Japan GSI Standard Map",
                                "allTranslatedTitle": {
                                    "en": "Japan GSI Standard Map"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "url",
                                "title": "URL",
                                "allTranslatedTitle": {
                                    "en": "URL"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Tile type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_url",
                        "type": "STRING",
                        "title": "Tile map URL",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "tile_type",
                            "type": "STRING",
                            "value": "url"
                        },
                        "allTranslatedTitle": {
                            "en": "Tile map URL"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_minLevel",
                        "type": "NUMBER",
                        "title": "Minimum zoom level",
                        "description": "",
                        "defaultValue": null,
                        "min": 0,
                        "max": 30,
                        "allTranslatedTitle": {
                            "en": "Minimum zoom level"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_maxLevel",
                        "type": "NUMBER",
                        "title": "Maximum zoom level",
                        "description": "",
                        "defaultValue": null,
                        "min": 0,
                        "max": 30,
                        "allTranslatedTitle": {
                            "en": "Maximum zoom level"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_opacity",
                        "type": "NUMBER",
                        "title": "Opacity",
                        "description": "Change the opacity of the selected tile map. Min: 0 Max: 1",
                        "defaultValue": 1,
                        "ui": "SLIDER",
                        "min": 0,
                        "max": 1,
                        "allTranslatedTitle": {
                            "en": "Opacity"
                        },
                        "allTranslatedDescription": {
                            "en": "Change the opacity of the selected tile map. Min: 0 Max: 1"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": true,
                "title": "Tiles",
                "allTranslatedTitle": {
                    "en": "Tiles"
                },
                "representativeFieldId": "tile_type",
                "representativeField": {
                    "fieldId": "tile_type",
                    "type": "STRING",
                    "title": "Tile type",
                    "description": "",
                    "defaultValue": "default",
                    "choices": [
                        {
                            "key": "default",
                            "title": "Default",
                            "allTranslatedTitle": {
                                "en": "Default"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "default_label",
                            "title": "Labelled",
                            "allTranslatedTitle": {
                                "en": "Labelled"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "default_road",
                            "title": "Road Map",
                            "allTranslatedTitle": {
                                "en": "Road Map"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "stamen_watercolor",
                            "title": "Stamen Watercolor",
                            "allTranslatedTitle": {
                                "en": "Stamen Watercolor"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "stamen_toner",
                            "title": "Stamen Toner",
                            "allTranslatedTitle": {
                                "en": "Stamen Toner"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "open_street_map",
                            "title": "OpenStreetMap",
                            "allTranslatedTitle": {
                                "en": "OpenStreetMap"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "esri_world_topo",
                            "title": "ESRI Topography",
                            "allTranslatedTitle": {
                                "en": "ESRI Topography"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "black_marble",
                            "title": "Earth at night",
                            "allTranslatedTitle": {
                                "en": "Earth at night"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "japan_gsi_standard",
                            "title": "Japan GSI Standard Map",
                            "allTranslatedTitle": {
                                "en": "Japan GSI Standard Map"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "url",
                            "title": "URL",
                            "allTranslatedTitle": {
                                "en": "URL"
                            },
                            "translatedTitle": ""
                        }
                    ],
                    "allTranslatedTitle": {
                        "en": "Tile type"
                    },
                    "translatedTitle": "",
                    "translatedDescription": ""
                },
                "translatedTitle": ""
            }
        ],
        "linkableFields": {
            "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm"
        }
    },
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
        "groups": [
            {
                "schemaGroupId": "page_settings",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
                "fields": [
                    {
                        "fieldId": "page_type",
                        "type": "STRING",
                        "title": "Page type",
                        "description": "",
                        "defaultValue": null,
                        "choices": [
                            {
                                "key": "welcome",
                                "title": "Welcome Page",
                                "allTranslatedTitle": {
                                    "en": "Welcome Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "markdown",
                                "title": "MD Content Page",
                                "allTranslatedTitle": {
                                    "en": "MD Content Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "tutorial",
                                "title": "Tutorial Page",
                                "allTranslatedTitle": {
                                    "en": "Tutorial Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "agreement",
                                "title": "Agreement Page",
                                "allTranslatedTitle": {
                                    "en": "Agreement Page"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Page type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_title",
                        "type": "STRING",
                        "title": "Title",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Title"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_description",
                        "type": "STRING",
                        "title": "Description",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Description"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "welcome_video_url",
                        "type": "URL",
                        "title": "Video url",
                        "description": "",
                        "defaultValue": null,
                        "ui": "FILE",
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome"
                        },
                        "allTranslatedTitle": {
                            "en": "Video url"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "markdown_content",
                        "type": "STRING",
                        "title": "MD Content",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "markdown"
                        },
                        "allTranslatedTitle": {
                            "en": "MD Content"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": true,
                "title": "Page Settings",
                "allTranslatedTitle": {
                    "en": "Page Settings"
                },
                "representativeFieldId": "page_type",
                "representativeField": {
                    "fieldId": "page_type",
                    "type": "STRING",
                    "title": "Page type",
                    "description": "",
                    "defaultValue": null,
                    "choices": [
                        {
                            "key": "welcome",
                            "title": "Welcome Page",
                            "allTranslatedTitle": {
                                "en": "Welcome Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "markdown",
                            "title": "MD Content Page",
                            "allTranslatedTitle": {
                                "en": "MD Content Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "tutorial",
                            "title": "Tutorial Page",
                            "allTranslatedTitle": {
                                "en": "Tutorial Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "agreement",
                            "title": "Agreement Page",
                            "allTranslatedTitle": {
                                "en": "Agreement Page"
                            },
                            "translatedTitle": ""
                        }
                    ],
                    "allTranslatedTitle": {
                        "en": "Page type"
                    },
                    "translatedTitle": "",
                    "translatedDescription": ""
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "appearance",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
                "fields": [
                    {
                        "fieldId": "primary_color",
                        "type": "STRING",
                        "title": "Primary color",
                        "description": "",
                        "defaultValue": null,
                        "ui": "COLOR",
                        "allTranslatedTitle": {
                            "en": "Primary color"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": false,
                "title": "Appearance",
                "allTranslatedTitle": {
                    "en": "Appearance"
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "available_if_test",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
                "fields": [
                    {
                        "fieldId": "test_type",
                        "type": "STRING",
                        "title": "Test type",
                        "description": "",
                        "defaultValue": null,
                        "choices": [
                            {
                                "key": "type_a",
                                "title": "A",
                                "allTranslatedTitle": {
                                    "en": "A"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "type_b",
                                "title": "B",
                                "allTranslatedTitle": {
                                    "en": "B"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Test type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "test_value_a",
                        "type": "STRING",
                        "title": "Value A",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "test_type",
                            "type": "STRING",
                            "value": "type_a"
                        },
                        "allTranslatedTitle": {
                            "en": "Value A"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "test_value_b",
                        "type": "STRING",
                        "title": "Value B",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "test_type",
                            "type": "STRING",
                            "value": "type_b"
                        },
                        "allTranslatedTitle": {
                            "en": "Value B"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": false,
                "title": "Avaliable If Test",
                "allTranslatedTitle": {
                    "en": "Avaliable If Test"
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "tiles",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
                "fields": [
                    {
                        "fieldId": "tile_type",
                        "type": "STRING",
                        "title": "Tile type",
                        "description": "",
                        "defaultValue": "default",
                        "choices": [
                            {
                                "key": "default",
                                "title": "Default",
                                "allTranslatedTitle": {
                                    "en": "Default"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "default_label",
                                "title": "Labelled",
                                "allTranslatedTitle": {
                                    "en": "Labelled"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "default_road",
                                "title": "Road Map",
                                "allTranslatedTitle": {
                                    "en": "Road Map"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "stamen_watercolor",
                                "title": "Stamen Watercolor",
                                "allTranslatedTitle": {
                                    "en": "Stamen Watercolor"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "stamen_toner",
                                "title": "Stamen Toner",
                                "allTranslatedTitle": {
                                    "en": "Stamen Toner"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "open_street_map",
                                "title": "OpenStreetMap",
                                "allTranslatedTitle": {
                                    "en": "OpenStreetMap"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "esri_world_topo",
                                "title": "ESRI Topography",
                                "allTranslatedTitle": {
                                    "en": "ESRI Topography"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "black_marble",
                                "title": "Earth at night",
                                "allTranslatedTitle": {
                                    "en": "Earth at night"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "japan_gsi_standard",
                                "title": "Japan GSI Standard Map",
                                "allTranslatedTitle": {
                                    "en": "Japan GSI Standard Map"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "url",
                                "title": "URL",
                                "allTranslatedTitle": {
                                    "en": "URL"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Tile type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_url",
                        "type": "STRING",
                        "title": "Tile map URL",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "tile_type",
                            "type": "STRING",
                            "value": "url"
                        },
                        "allTranslatedTitle": {
                            "en": "Tile map URL"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_minLevel",
                        "type": "NUMBER",
                        "title": "Minimum zoom level",
                        "description": "",
                        "defaultValue": null,
                        "min": 0,
                        "max": 30,
                        "allTranslatedTitle": {
                            "en": "Minimum zoom level"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_maxLevel",
                        "type": "NUMBER",
                        "title": "Maximum zoom level",
                        "description": "",
                        "defaultValue": null,
                        "min": 0,
                        "max": 30,
                        "allTranslatedTitle": {
                            "en": "Maximum zoom level"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tile_opacity",
                        "type": "NUMBER",
                        "title": "Opacity",
                        "description": "Change the opacity of the selected tile map. Min: 0 Max: 1",
                        "defaultValue": 1,
                        "ui": "SLIDER",
                        "min": 0,
                        "max": 1,
                        "allTranslatedTitle": {
                            "en": "Opacity"
                        },
                        "allTranslatedDescription": {
                            "en": "Change the opacity of the selected tile map. Min: 0 Max: 1"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": true,
                "title": "Tiles",
                "allTranslatedTitle": {
                    "en": "Tiles"
                },
                "representativeFieldId": "tile_type",
                "representativeField": {
                    "fieldId": "tile_type",
                    "type": "STRING",
                    "title": "Tile type",
                    "description": "",
                    "defaultValue": "default",
                    "choices": [
                        {
                            "key": "default",
                            "title": "Default",
                            "allTranslatedTitle": {
                                "en": "Default"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "default_label",
                            "title": "Labelled",
                            "allTranslatedTitle": {
                                "en": "Labelled"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "default_road",
                            "title": "Road Map",
                            "allTranslatedTitle": {
                                "en": "Road Map"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "stamen_watercolor",
                            "title": "Stamen Watercolor",
                            "allTranslatedTitle": {
                                "en": "Stamen Watercolor"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "stamen_toner",
                            "title": "Stamen Toner",
                            "allTranslatedTitle": {
                                "en": "Stamen Toner"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "open_street_map",
                            "title": "OpenStreetMap",
                            "allTranslatedTitle": {
                                "en": "OpenStreetMap"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "esri_world_topo",
                            "title": "ESRI Topography",
                            "allTranslatedTitle": {
                                "en": "ESRI Topography"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "black_marble",
                            "title": "Earth at night",
                            "allTranslatedTitle": {
                                "en": "Earth at night"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "japan_gsi_standard",
                            "title": "Japan GSI Standard Map",
                            "allTranslatedTitle": {
                                "en": "Japan GSI Standard Map"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "url",
                            "title": "URL",
                            "allTranslatedTitle": {
                                "en": "URL"
                            },
                            "translatedTitle": ""
                        }
                    ],
                    "allTranslatedTitle": {
                        "en": "Tile type"
                    },
                    "translatedTitle": "",
                    "translatedDescription": ""
                },
                "translatedTitle": ""
            }
        ],
        "linkableFields": {
            "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm"
        }
    },
    {
        "id": "01jaxywcjw38sv2v28e4hcbha8~reearth-visualizer-plugin-welcome-page~1.0.0/welcome",
        "groups": [
            {
                "schemaGroupId": "page_setting",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-visualizer-plugin-welcome-page~1.0.0/welcome",
                "fields": [
                    {
                        "fieldId": "page_type",
                        "type": "STRING",
                        "title": "Page Type",
                        "description": "",
                        "defaultValue": "welcome_page",
                        "choices": [
                            {
                                "key": "welcome_page",
                                "title": "Welcome Page",
                                "allTranslatedTitle": {
                                    "en": "Welcome Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "md_page",
                                "title": "MD Content Page",
                                "allTranslatedTitle": {
                                    "en": "MD Content Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "tutorial_page",
                                "title": "Tutorial Page",
                                "allTranslatedTitle": {
                                    "en": "Tutorial Page"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "agreement_page",
                                "title": "Agreement Page",
                                "allTranslatedTitle": {
                                    "en": "Agreement Page"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "allTranslatedTitle": {
                            "en": "Page Type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "page_title",
                        "type": "STRING",
                        "title": "Welcome Page Title",
                        "description": "",
                        "defaultValue": null,
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome_page"
                        },
                        "allTranslatedTitle": {
                            "en": "Welcome Page Title"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "page_description",
                        "type": "STRING",
                        "title": "Welcome Page Description",
                        "description": "",
                        "defaultValue": null,
                        "ui": "MULTILINE",
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome_page"
                        },
                        "allTranslatedTitle": {
                            "en": "Welcome Page Description"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "media_type",
                        "type": "STRING",
                        "title": "Welcome Page Media Type",
                        "description": "",
                        "defaultValue": null,
                        "choices": [
                            {
                                "key": "image_type",
                                "title": "Image",
                                "allTranslatedTitle": {
                                    "en": "Image"
                                },
                                "translatedTitle": ""
                            },
                            {
                                "key": "video_type",
                                "title": "Video",
                                "allTranslatedTitle": {
                                    "en": "Video"
                                },
                                "translatedTitle": ""
                            }
                        ],
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "welcome_page"
                        },
                        "allTranslatedTitle": {
                            "en": "Welcome Page Media Type"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "media_url",
                        "type": "URL",
                        "title": "Welcome Page Media Image",
                        "description": "",
                        "defaultValue": null,
                        "ui": "IMAGE",
                        "isAvailableIf": {
                            "fieldId": "media_type",
                            "type": "STRING",
                            "value": "image_type"
                        },
                        "allTranslatedTitle": {
                            "en": "Welcome Page Media Image"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "video_url",
                        "type": "URL",
                        "title": "Welcome Page Media Video",
                        "description": "",
                        "defaultValue": null,
                        "ui": "VIDEO",
                        "isAvailableIf": {
                            "fieldId": "media_type",
                            "type": "STRING",
                            "value": "video_type"
                        },
                        "allTranslatedTitle": {
                            "en": "Welcome Page Media Video"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "thumbnail_video_url",
                        "type": "URL",
                        "title": "Welcome Page Media Video Thumbnail",
                        "description": "",
                        "defaultValue": null,
                        "ui": "IMAGE",
                        "isAvailableIf": {
                            "fieldId": "media_type",
                            "type": "STRING",
                            "value": "video_type"
                        },
                        "allTranslatedTitle": {
                            "en": "Welcome Page Media Video Thumbnail"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "tutorial_page_image_url",
                        "type": "URL",
                        "title": "Tutorial Page Image",
                        "description": "",
                        "defaultValue": null,
                        "ui": "IMAGE",
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "tutorial_page"
                        },
                        "allTranslatedTitle": {
                            "en": "Tutorial Page Image"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "md_content",
                        "type": "STRING",
                        "title": "MD Page Content",
                        "description": "For markdown content",
                        "defaultValue": null,
                        "ui": "MULTILINE",
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "md_page"
                        },
                        "allTranslatedTitle": {
                            "en": "MD Page Content"
                        },
                        "allTranslatedDescription": {
                            "en": "For markdown content"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "agree_content",
                        "type": "STRING",
                        "title": "Agreement",
                        "description": "Markdown content for agreement page",
                        "defaultValue": null,
                        "ui": "MULTILINE",
                        "isAvailableIf": {
                            "fieldId": "page_type",
                            "type": "STRING",
                            "value": "agreement_page"
                        },
                        "allTranslatedTitle": {
                            "en": "Agreement"
                        },
                        "allTranslatedDescription": {
                            "en": "Markdown content for agreement page"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": true,
                "title": "Page",
                "allTranslatedTitle": {
                    "en": "Page"
                },
                "representativeFieldId": "page_type",
                "representativeField": {
                    "fieldId": "page_type",
                    "type": "STRING",
                    "title": "Page Type",
                    "description": "",
                    "defaultValue": "welcome_page",
                    "choices": [
                        {
                            "key": "welcome_page",
                            "title": "Welcome Page",
                            "allTranslatedTitle": {
                                "en": "Welcome Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "md_page",
                            "title": "MD Content Page",
                            "allTranslatedTitle": {
                                "en": "MD Content Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "tutorial_page",
                            "title": "Tutorial Page",
                            "allTranslatedTitle": {
                                "en": "Tutorial Page"
                            },
                            "translatedTitle": ""
                        },
                        {
                            "key": "agreement_page",
                            "title": "Agreement Page",
                            "allTranslatedTitle": {
                                "en": "Agreement Page"
                            },
                            "translatedTitle": ""
                        }
                    ],
                    "allTranslatedTitle": {
                        "en": "Page Type"
                    },
                    "translatedTitle": "",
                    "translatedDescription": ""
                },
                "translatedTitle": ""
            },
            {
                "schemaGroupId": "appearance",
                "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-visualizer-plugin-welcome-page~1.0.0/welcome",
                "fields": [
                    {
                        "fieldId": "primary_color",
                        "type": "STRING",
                        "title": "Primary Color",
                        "description": "",
                        "defaultValue": "#0085BE",
                        "ui": "COLOR",
                        "allTranslatedTitle": {
                            "en": "Primary Color"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    },
                    {
                        "fieldId": "bg_color",
                        "type": "STRING",
                        "title": "Background Color",
                        "description": "",
                        "defaultValue": "#000",
                        "ui": "COLOR",
                        "allTranslatedTitle": {
                            "en": "Background Color"
                        },
                        "translatedTitle": "",
                        "translatedDescription": ""
                    }
                ],
                "isList": false,
                "title": "Appearance",
                "allTranslatedTitle": {
                    "en": "Appearance"
                },
                "translatedTitle": ""
            }
        ],
        "linkableFields": {
            "schemaId": "01jaxywcjw38sv2v28e4hcbha8~reearth-visualizer-plugin-welcome-page~1.0.0/welcome"
        }
    }
]
`)
