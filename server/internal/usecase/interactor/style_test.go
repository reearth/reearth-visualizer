package interactor

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestImportStyles ./internal/usecase/interactor/...

func TestImportStyles(t *testing.T) {
	ctx := context.Background()

	db := memory.New()
	ifs := NewStyle(db)

	ws := workspace.New().NewID().Policy(policy.ID("policy").Ref()).MustBuild()
	prj, _ := project.New().NewID().Workspace(ws.ID()).Build()
	_ = db.Project.Save(ctx, prj)
	scene, _ := scene.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Build()
	_ = db.Scene.Save(ctx, scene)

	var sceneData map[string]interface{}
	err := json.Unmarshal([]byte(fmt.Sprintf(`{
    "schemaVersion": 1,
    "id": "%s",
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
    ]
  }`, scene.ID())), &sceneData)
	assert.NoError(t, err)

	// invoke the target function
	result, _, err := ifs.ImportStyles(ctx, scene.ID(), sceneData)
	assert.NoError(t, err)
	assert.NotNil(t, result)

	// actual
	temp := gqlmodel.ToStyles(result)
	resultJSON, err := json.Marshal(temp)
	assert.NoError(t, err)
	actual := string(resultJSON)

	// expected
	exp := fmt.Sprintf(`[
		{
		  "id": "%s",
		  "sceneId": "%s",
		  "name": "スタイル_0",
		  "value": {
			"color": "red"
		  }
		},
		{
		  "id": "%s",
		  "sceneId": "%s",
		  "name": "スタイル_1",
		  "value": {
			"font": "bold"
		  }
		}
	  ]`, temp[0].ID, scene.ID(), temp[1].ID, scene.ID())
	var expectedMap []map[string]interface{}
	err = json.Unmarshal([]byte(exp), &expectedMap)
	assert.NoError(t, err)
	expectedJSON, err := json.Marshal(expectedMap)
	assert.NoError(t, err)
	expected := string(expectedJSON)

	// comparison check
	assert.JSONEq(t, expected, actual)
}
