package interactor

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestImportPlugins(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	is := NewPlugin(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	var pluginsData []interface{}
	err := json.Unmarshal([]byte(`[
    {
      "id": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0",
      "sceneId": "01j7g9ddv4sbf8tgt5c6xxj5xc",
      "name": "Plugin Communication Demo for Beta",
      "version": "1.0.0",
      "description": "",
      "author": "",
      "repositoryUrl": "",
      "extensions": [
        {
          "extensionId": "widgetcomm",
          "pluginId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "WIDGET",
          "name": "Communication Demo Widget",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
          "allTranslatedName": {
            "en": "Communication Demo Widget"
          },
          "translatedName": "",
          "translatedDescription": ""
        },
        {
          "extensionId": "storyblockcomm",
          "pluginId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "StoryBlock",
          "name": "Communication Demo Story Block",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
          "allTranslatedName": {
            "en": "Communication Demo Story Block"
          },
          "translatedName": "",
          "translatedDescription": ""
        },
        {
          "extensionId": "infoboxblockcomm",
          "pluginId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "InfoboxBlock",
          "name": "Communication Demo Infobox Block",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
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
    }
  ]`), &pluginsData)
	assert.NoError(t, err)

	// invoke the target function
	result, err := is.ImportPlugins(ctx, pluginsData)
	assert.NoError(t, err)
	assert.NotNil(t, result)

	// actual
	temp := gqlmodel.ToPlugins(result)
	resultJSON, err := json.Marshal(temp)
	assert.NoError(t, err)
	actual := string(resultJSON)

	// expected
	var expectedMap []map[string]interface{}
	err = json.Unmarshal([]byte(`[
    {
      "id": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0",
      "sceneId": "01j7g9ddv4sbf8tgt5c6xxj5xc",
      "name": "Plugin Communication Demo for Beta",
      "version": "1.0.0",
      "description": "",
      "author": "",
      "repositoryUrl": "",
      "extensions": [
        {
          "extensionId": "widgetcomm",
          "pluginId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "WIDGET",
          "name": "Communication Demo Widget",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
          "allTranslatedName": {
            "en": "Communication Demo Widget"
          },
          "translatedName": "",
          "translatedDescription": ""
        },
        {
          "extensionId": "storyblockcomm",
          "pluginId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "StoryBlock",
          "name": "Communication Demo Story Block",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
          "allTranslatedName": {
            "en": "Communication Demo Story Block"
          },
          "translatedName": "",
          "translatedDescription": ""
        },
        {
          "extensionId": "infoboxblockcomm",
          "pluginId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "InfoboxBlock",
          "name": "Communication Demo Infobox Block",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "01j7g9ddv4sbf8tgt5c6xxj5xc~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
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
    }
  ]`), &expectedMap)
	assert.NoError(t, err)
	expectedJSON, err := json.Marshal(expectedMap)
	assert.NoError(t, err)
	expected := string(expectedJSON)

	// comparison check
	assert.JSONEq(t, expected, actual)

}
