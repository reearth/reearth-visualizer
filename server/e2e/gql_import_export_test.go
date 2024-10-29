package e2e

import (
	"fmt"
	"net/http"
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestCallExportProject ./e2e/...

func TestCallExportProject(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProjectWithExternalImage(e, "test")

	_, _, sID := createScene(e, pID)
	createStory(e, sID, "test", 0)

	fileName := exporProject(t, e, pID)

	defer func() {
		err := os.Remove(fileName)
		assert.Nil(t, err)
	}()

}

func createProjectWithExternalImage(e *httpexpect.Expect, name string) string {
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query: `mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL, $coreSupport: Boolean) {
			createProject( input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl, coreSupport: $coreSupport} ) { 
				project { 
					id
					__typename 
				} 
				__typename 
			}
		}`,
		Variables: map[string]any{
			"name":        name,
			"description": "abc",
			"imageUrl":    "https://test.com/aaaaa.jpg",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
			"coreSupport": true,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res.Path("$.data.createProject.project.id").Raw().(string)
}

func exporProject(t *testing.T, e *httpexpect.Expect, p string) string {
	requestBody := GraphQLRequest{
		OperationName: "ExportProject",
		Query:         "mutation ExportProject($projectId: ID!) { exportProject(input: {projectId: $projectId}) { projectDataPath __typename } }",
		Variables: map[string]any{
			"projectId": p,
		},
	}
	downloadPath := e.POST("/api/graphql").
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
		Value("projectDataPath").String().Raw()
	fmt.Println(downloadPath)

	downloadResponse := e.GET(fmt.Sprintf("http://localhost:8080%s", downloadPath)).
		Expect().
		Status(http.StatusOK).
		Body().Raw()

	fileName := "project_data.zip"
	err := os.WriteFile(fileName, []byte(downloadResponse), os.ModePerm)
	assert.Nil(t, err)
	return fileName
}
