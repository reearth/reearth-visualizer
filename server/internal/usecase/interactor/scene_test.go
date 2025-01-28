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
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestImportScene ./internal/usecase/interactor/...
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
	sce, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).RootLayer(id.NewLayerID()).Build()
	_ = db.Scene.Save(ctx, sce)

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
    "layerStyles": null,
    "coreSupport": true,
    "enableGa": false,
    "trackingId": ""
  }`), &sceneData)
	assert.NoError(t, err)

	// invoke the target function
	result, err := ifs.ImportScene(ctx, sce, prj, []*plugin.Plugin{}, sceneData)
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
	delete(resultMap, "createdAt")

	if widgets, ok := resultMap["widgets"].([]interface{}); ok {
		for _, widget := range widgets {
			if widgetMap, ok := widget.(map[string]interface{}); ok {
				delete(widgetMap, "id") // id is skip
				delete(widgetMap, "propertyId")
			}
		}
	}

	if widgetAlignSystem, ok := resultMap["widgetAlignSystem"].(map[string]interface{}); ok {
		if outer, ok := widgetAlignSystem["outer"].(map[string]interface{}); ok {
			if left, ok := outer["left"].(map[string]interface{}); ok {
				if top, ok := left["top"].(map[string]interface{}); ok {
					delete(top, "widgetIds")
				}
			}
			if right, ok := outer["right"].(map[string]interface{}); ok {
				if top, ok := right["top"].(map[string]interface{}); ok {
					delete(top, "widgetIds")
				}
			}
		}
	}

	resultJSON, err = json.Marshal(resultMap)
	assert.NoError(t, err)
	actual := string(resultJSON)

	// expected
	exp := fmt.Sprintf(`{
    "datasetSchemas": null,
    "id": "%s",
    "newLayers": null,
    "plugins": [],
    "projectId": "%s",
    "stories": null,
    "styles": null,
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
                    }
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
                    }
                }
            }
        }
    },
    "widgets": [
        {
            "enabled": false,
            "extended": false,
            "extensionId": "button",
            "pluginId": "reearth"
        },
        {
            "enabled": false,
            "extended": false,
            "extensionId": "navigator",
            "pluginId": "reearth"
        }
    ]
  }`, result.ID(), prj.ID(), prj.Workspace())
	var expectedMap map[string]interface{}
	err = json.Unmarshal([]byte(exp), &expectedMap)
	assert.NoError(t, err)
	expectedJSON, err := json.Marshal(expectedMap)
	assert.NoError(t, err)
	expected := string(expectedJSON)

	// Comparison check
	assert.JSONEq(t, expected, actual)
}
