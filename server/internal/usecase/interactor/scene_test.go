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
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestImportScene(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	ifs := NewScene(db, &gateway.Container{
		File:           lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
		PluginRegistry: &mockPluginRegistry{},
	})

	ws := workspace.New().NewID().Policy(policy.ID("policy").Ref()).MustBuild()
	prj, _ := project.New().NewID().Workspace(ws.ID()).Build()
	_ = db.Project.Save(ctx, prj)

	var sceneData map[string]interface{}
	err := json.Unmarshal([]byte(`{
    "schemaVersion": 1,
    "id": "01j7g9ddv4sbf8tgt5c6xxj5xc",
    "publishedAt": "2024-09-11T19:23:44.223046+09:00",
    "property": {
      "tiles": [
        {
          "id": "01j7g9ddv4sbf8tgt5cbjxrksh"
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
    "layerStyles": null,
    "coreSupport": true,
    "enableGa": false,
    "trackingId": ""
  }`), &sceneData)
	assert.NoError(t, err)

	// invoke the target function
	result, err := ifs.ImportScene(ctx, prj, sceneData)
	assert.NoError(t, err)
	assert.NotNil(t, result)

	// actual
	temp := gqlmodel.ToScene(result)
	resultJSON, err := json.Marshal(temp)
	assert.NoError(t, err)

	// Exclude items that are updated upon creation.
	var resultMap map[string]interface{}
	err = json.Unmarshal(resultJSON, &resultMap)
	assert.NoError(t, err)
	delete(resultMap, "rootLayerId")
	delete(resultMap, "propertyId")
	delete(resultMap, "updatedAt")
	if widgets, ok := resultMap["widgets"].([]interface{}); ok {
		for _, widget := range widgets {
			if widgetMap, ok := widget.(map[string]interface{}); ok {
				delete(widgetMap, "propertyId")
			}
		}
	}

	resultJSON, err = json.Marshal(resultMap)
	assert.NoError(t, err)
	actual := string(resultJSON)

	// expected
	var expectedMap map[string]interface{}
	err = json.Unmarshal([]byte(fmt.Sprintf(`{
    "clusters": [],
    "createdAt": "2024-09-11T19:17:39.428+09:00",
    "datasetSchemas": null,
    "id": "01j7g9ddv4sbf8tgt5c6xxj5xc",
    "newLayers": null,
    "plugins": [],
    "projectId": "%s",
    "stories": null,
    "styles": null,
    "tagIds": null,
    "tags": null,
    "teamId": "%s",
    "widgetAlignSystem": {
        "inner": {
            "center": {
                "bottom": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "middle": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "top": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                }
            },
            "left": {
                "bottom": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "middle": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "top": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                }
            },
            "right": {
                "bottom": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "middle": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "top": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                }
            }
        },
        "outer": {
            "center": {
                "bottom": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "middle": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "top": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                }
            },
            "left": {
                "bottom": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "middle": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "top": {
                    "align": "START",
                    "centered": false,
                    "padding": {
                        "bottom": 0,
                        "left": 0,
                        "right": 0,
                        "top": 0
                    },
                    "widgetIds": [
                        "01j7g9h4f1k93vspn3gdtz67az",
                        "01j7g9jr89rjq1egrb1hhcd8jy"
                    ]
                }
            },
            "right": {
                "bottom": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "middle": {
                    "align": "START",
                    "centered": false,
                    "widgetIds": []
                },
                "top": {
                    "align": "START",
                    "centered": false,
                    "padding": {
                        "bottom": 0,
                        "left": 0,
                        "right": 0,
                        "top": 0
                    },
                    "widgetIds": [
                        "01j7g9jckefd0zxyy34bbygmhy"
                    ]
                }
            }
        }
    },
    "widgets": [
        {
            "enabled": false,
            "extended": false,
            "extensionId": "button",
            "id": "01j7g9h4f1k93vspn3gdtz67az",
            "pluginId": "reearth"
        },
        {
            "enabled": false,
            "extended": false,
            "extensionId": "navigator",
            "id": "01j7g9jckefd0zxyy34bbygmhy",
            "pluginId": "reearth"
        }
    ]
}`, prj.ID(), prj.Workspace())), &expectedMap)
	assert.NoError(t, err)
	expectedJSON, err := json.Marshal(expectedMap)
	assert.NoError(t, err)
	expected := string(expectedJSON)

	// Comparison check
	assert.JSONEq(t, expected, actual)
}
