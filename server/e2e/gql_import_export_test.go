package e2e

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestCallExportProject ./e2e/...

func TestCallExportProject(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e, "test")

	_, _, sID := createScene(e, pID)

	createStory(e, sID, "test", 0)

	requestBody := GraphQLRequest{
		OperationName: "ExportProject",
		Query:         "mutation ExportProject($projectId: ID!) { exportProject(input: {projectId: $projectId}) { projectData __typename } }",
		Variables: map[string]any{
			"projectId": pID,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("exportProject").Object().
		Value("projectData").Object()

	res.Value("scene").Object()
	res.Value("project").Object()
	res.Value("plugins").Array()

}

// go test -v -run TestCallImportProject ./e2e/...

func TestCallImportProject(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProject(e, "test")

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	testFilePath := "test_project.json"
	err := writeTestJSONFile(testFilePath, pID, wID.String(), sID, storyID)
	assert.NoError(t, err)
	defer func() {
		if err := os.Remove(testFilePath); err != nil {
			t.Fatalf("failed to delete test file: %v", err)
		}
	}()

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithMultipart().
		WithFormField("operations", `{
			"operationName": "ImportProject",
			"variables": {"file": null},
			"query": "mutation ImportProject($file: Upload!) { importProject(input: {file: $file}) { projectData __typename }}"
		}`).
		WithFormField("map", `{"1":["variables.file"]}`).
		WithFile("1", testFilePath).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("importProject").Object().
		Value("projectData").Object()

	res.Value("scene").Object()
	res.Value("project").Object()
	res.Value("plugins").Array()

}

func writeTestJSONFile(filePath string, pID string, wID string, sID string, storyID string) error {

	var data map[string]any
	err := json.Unmarshal([]byte(fmt.Sprintf(`{
  "plugins": [
    {
      "id": "%s~reearth-plugin-communication-demo-beta~1.0.0",
      "sceneId": "%s",
      "name": "Plugin Communication Demo for Beta",
      "version": "1.0.0",
      "description": "",
      "author": "",
      "repositoryUrl": "",
      "extensions": [
        {
          "extensionId": "widgetcomm",
          "pluginId": "%s~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "WIDGET",
          "name": "Communication Demo Widget",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "%s~reearth-plugin-communication-demo-beta~1.0.0/widgetcomm",
          "allTranslatedName": {
            "en": "Communication Demo Widget"
          },
          "translatedName": "",
          "translatedDescription": ""
        },
        {
          "extensionId": "storyblockcomm",
          "pluginId": "%s~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "StoryBlock",
          "name": "Communication Demo Story Block",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "%s~reearth-plugin-communication-demo-beta~1.0.0/storyblockcomm",
          "allTranslatedName": {
            "en": "Communication Demo Story Block"
          },
          "translatedName": "",
          "translatedDescription": ""
        },
        {
          "extensionId": "infoboxblockcomm",
          "pluginId": "%s~reearth-plugin-communication-demo-beta~1.0.0",
          "type": "InfoboxBlock",
          "name": "Communication Demo Infobox Block",
          "description": "",
          "icon": "",
          "singleOnly": false,
          "propertySchemaId": "%s~reearth-plugin-communication-demo-beta~1.0.0/infoboxblockcomm",
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
  ],
  "project": {
    "id": "%s",
    "isArchived": false,
    "isBasicAuthActive": false,
    "basicAuthUsername": "",
    "basicAuthPassword": "",
    "createdAt": "2024-09-11T19:17:39.418+09:00",
    "updatedAt": "2024-09-12T02:07:39.09Z",
    "name": "ProjectName1",
    "description": "ProjectOverview1",
    "alias": "",
    "publicTitle": "",
    "publicDescription": "",
    "publicImage": "",
    "publicNoIndex": false,
    "imageUrl": {
      "Scheme": "http",
      "Opaque": "",
      "User": null,
      "Host": "localhost:8080",
      "Path": "/assets/01j7g9d988ct8hajjxfsb6e1n6.jpeg",
      "RawPath": "",
      "OmitHost": false,
      "ForceQuery": false,
      "RawQuery": "",
      "Fragment": "",
      "RawFragment": ""
    },
    "teamId": "%s",
    "visualizer": "cesium",
    "publishmentStatus": "PRIVATE",
    "coreSupport": true,
    "enableGa": false,
    "trackingId": "",
    "starred": false
  },
  "scene": {
    "schemaVersion": 1,
    "id": "%s",
    "publishedAt": "2024-09-12T11:07:46.117668+09:00",
    "property": {
      "default": {
        "ion": {
          "type": "string",
          "value": ""
        }
      },
      "tiles": [
        {
          "id": "01j7g9ddv4sbf8tgt5cbjxrksh",
          "tile_opacity": {
            "type": "number",
            "value": 1
          }
        },
        {
          "id": "01j7hzp3akr64nz033582braxa",
          "tile_type": {
            "type": "string",
            "value": "default_label"
          },
          "tile_zoomLevel": {
            "type": "array",
            "value": [
              null,
              null
            ]
          }
        }
      ]
    },
    "plugins": {},
    "layers": null,
    "widgets": [
      {
        "id": "01j7g9h4f1k93vspn3gdtz67az",
        "pluginId": "reearth",
        "extensionId": "button",
        "property": {
          "default": {
            "buttonBgcolor": {
              "type": "string",
              "value": "#79b4beff"
            },
            "buttonColor": {
              "type": "string",
              "value": "#171289ff"
            },
            "buttonTitle": {
              "type": "string",
              "value": "TestButton1"
            }
          }
        },
        "enabled": false,
        "extended": false
      },
      {
        "id": "01j7g9jckefd0zxyy34bbygmhy",
        "pluginId": "reearth",
        "extensionId": "navigator",
        "property": {
          "default": {
            "visible": {
              "type": "string",
              "value": "desktop"
            }
          }
        },
        "enabled": false,
        "extended": false
      }
    ],
    "widgetAlignSystem": {
      "inner": null,
      "outer": {
        "left": {
          "top": {
            "widgetIds": [
              "01j7g9h4f1k93vspn3gdtz67az",
              "01j7g9jr89rjq1egrb1hhcd8jy"
            ],
            "align": "start",
            "padding": {
              "top": 0,
              "bottom": 0,
              "left": 0,
              "right": 0
            },
            "gap": null,
            "centered": false,
            "background": null
          },
          "middle": null,
          "bottom": null
        },
        "center": null,
        "right": {
          "top": {
            "widgetIds": [
              "01j7g9jckefd0zxyy34bbygmhy"
            ],
            "align": "start",
            "padding": {
              "top": 0,
              "bottom": 0,
              "left": 0,
              "right": 0
            },
            "gap": null,
            "centered": false,
            "background": null
          },
          "middle": null,
          "bottom": null
        }
      }
    },
    "tags": [],
    "clusters": [],
    "story": {
      "id": "%s",
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
    },
    "nlsLayers": [
      {
        "id": "01j7g9gwj6qbv286pcwwmwq5ds",
        "title": "japan_architecture (2).csv",
        "layerType": "simple",
        "config": {
          "data": {
            "csv": {
              "latColumn": "lat",
              "lngColumn": "lng"
            },
            "type": "csv",
            "url": "http://localhost:8080/assets/01j7g9gpba44e0nxwc727nax0q.csv"
          },
          "layerStyleId": ""
        },
        "isVisible": true,
        "nlsInfobox": {
          "id": "01j7hzs4e48p8s1cw7thep56b4",
          "property": {},
          "blocks": []
        },
        "isSketch": false
      }
    ],
    "layerStyles": [
      {
        "id": "01j7hzqgycv76hxsygmcrb47m6",
        "name": "スタイル_0",
        "value": {
          "color": "red"
        }
      },
      {
        "id": "01j7hzrgc3ag8m1ftzye05csgx",
        "name": "スタイル_1",
        "value": {
          "font": "bold"
        }
      }
    ],
    "coreSupport": true,
    "enableGa": false,
    "trackingId": ""
  }
}`, sID, sID, sID, sID, sID, sID, sID, sID, pID, wID, sID, storyID)), &data)
	if err != nil {
		return err
	}
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer func() {
		if cerr := file.Close(); cerr != nil {
			err = cerr
		}
	}()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}
