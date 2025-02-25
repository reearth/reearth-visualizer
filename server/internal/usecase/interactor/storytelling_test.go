package interactor

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/idx"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestImportStory ./internal/usecase/interactor/...

func TestImportStory(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	ifs := NewStorytelling(db, &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	})

	prj, _ := project.New().NewID().Build()
	_ = db.Project.Save(ctx, prj)
	scene, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, scene)

	var sceneData map[string]interface{}
	err := json.Unmarshal([]byte(fmt.Sprintf(`{
    "schemaVersion": 1,
    "id": "%s",
    "story": {
      "id": "01j7g9ddvkarms2gmc59ysw66r",
      "property": {},
      "pages": [
        {
          "id": "01j7g9ddwk4a12x1t8wm865s6h",
          "property": {
            "title": {
              "color": {
                "type": "string",
                "value": "#9a19bfff"
              },
              "title": {
                "type": "string",
                "value": "Title1"
              }
            }
          },
          "title": "Untitled",
          "blocks": [
            {
              "id": "01j7g9mdnjk1jafw592btqx6t7",
              "property": {
                "default": {
                  "text": {
                    "type": "string",
                    "value": "{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":1,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Block1\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}"
                  }
                }
              },
              "plugins": null,
              "extensionId": "textStoryBlock",
              "pluginId": "reearth"
            },
            {
              "id": "01j7g9n3x4yqae71crdjcpeyc0",
              "property": {
                "default": {
                  "text": {
                    "type": "string",
                    "value": "## MarkDown1"
                  }
                }
              },
              "plugins": null,
              "extensionId": "mdTextStoryBlock",
              "pluginId": "reearth"
            },
            {
              "id": "01j7g9nnnap0cwa1farwd841xc",
              "property": {
                "default": {
                  "src": {
                    "type": "url",
                    "value": "http://localhost:8080/assets/01j7g9nwtq1zqc7ex5gfvd1mbe.jpeg"
                  }
                }
              },
              "plugins": null,
              "extensionId": "imageStoryBlock",
              "pluginId": "reearth"
            }
          ],
          "swipeable": false,
          "swipeableLayers": null,
          "layers": []
        }
      ],
      "position": "right",
      "bgColor": "#b2efd8ff"
    }
  }`, scene.ID())), &sceneData)
	assert.NoError(t, err)

	// invoke the target function
	result, err := ifs.ImportStory(ctx, scene.ID(), sceneData, map[string]idx.ID[id.NLSLayer]{})
	assert.NoError(t, err)
	assert.NotNil(t, result)

	// actual
	temp := gqlmodel.ToStory(result)
	resultByte, err := json.Marshal(temp)
	assert.NoError(t, err)
	var resultMap map[string]interface{}
	err = json.Unmarshal(resultByte, &resultMap)
	assert.NoError(t, err)

	// Exclude items that are updated upon creation.
	delete(resultMap, "id")
	delete(resultMap, "propertyId")
	delete(resultMap, "updatedAt")
	delete(resultMap, "createdAt")
	if pages, ok := resultMap["pages"].([]interface{}); ok {
		for _, page := range pages {
			if pageMap, ok := page.(map[string]interface{}); ok {
				delete(pageMap, "id") // id is skip
				delete(pageMap, "propertyId")
				delete(pageMap, "updatedAt")
				delete(pageMap, "createdAt")
				delete(pageMap, "sceneId")
				if blocks, ok := pageMap["blocks"].([]interface{}); ok {
					for _, block := range blocks {
						if blockMap, ok := block.(map[string]interface{}); ok {
							delete(blockMap, "id") // id is skip
							delete(blockMap, "propertyId")
						}
					}
				}
			}
		}
	}
	actualByte, err := json.Marshal(resultMap)
	assert.NoError(t, err)
	actual := string(actualByte)

	// expected
	var expectedMap map[string]interface{}
	err = json.Unmarshal([]byte(fmt.Sprintf(`{
    "title": "",
    "alias": "",
    "pages": [
        {
            "title": "Untitled",
            "blocks": [
                {
                    "pluginId": "reearth",
                    "extensionId": "textStoryBlock"
                },
                {
                    "pluginId": "reearth",
                    "extensionId": "mdTextStoryBlock"
                },
                {
                    "pluginId": "reearth",
                    "extensionId": "imageStoryBlock"
                }
            ],
            "swipeable": false,
            "layersIds": null,
            "layers": null
        }
    ],
    "publishmentStatus": "",
    "sceneId": "%s",
    "panelPosition": "RIGHT",
    "bgColor": "#b2efd8ff",
    "isBasicAuthActive": false,
    "basicAuthUsername": "",
    "basicAuthPassword": "",
    "publicTitle": "",
    "publicDescription": "",
    "publicImage": "",
    "publicNoIndex": false
}`, scene.ID())), &expectedMap)
	assert.NoError(t, err)
	expectedJSON, err := json.Marshal(expectedMap)
	assert.NoError(t, err)
	expected := string(expectedJSON)

	// comparison check
	assert.JSONEq(t, expected, actual)
}
