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

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID := createPage(e, sID, storyID, "test", true)

	_, _, _ = createBlock(e, sID, storyID, pageID, "reearth", "imageStoryBlock", nil)
	_, _, _ = createBlock(e, sID, storyID, pageID, "reearth", "imageStoryBlock", nil)
	_, _, _ = createBlock(e, sID, storyID, pageID, "reearth", "imageStoryBlock", nil)

	_, res := fetchSceneForStories(e, sID)

	blocks := res.Object().Value("data").Object().
		Value("node").Object().
		Value("stories").Array().First().Object().
		Value("pages").Array().First().Object().
		Value("blocks").Array().Iter()

	propID1 := blocks[0].Object().Value("propertyId").Raw().(string)
	propID2 := blocks[1].Object().Value("propertyId").Raw().(string)
	propID3 := blocks[2].Object().Value("propertyId").Raw().(string)

	_, res = updatePropertyValue(e, propID1, "default", "", "src", "http://localhost:8080/assets/01jbbhhtq2jq7mx39dhyq1cfr2.png", "URL")
	res.Path("$.data.updatePropertyValue.propertyField.value").Equal("http://localhost:8080/assets/01jbbhhtq2jq7mx39dhyq1cfr2.png")

	_, res = updatePropertyValue(e, propID2, "default", wID.String(), "src", "https://test.com/project.jpg", "URL")
	res.Path("$.data.updatePropertyValue.propertyField.value").Equal("https://test.com/project.jpg")

	_, res = updatePropertyValue(e, propID3, "default", wID.String(), "src", "https://api.visualizer.test.reearth.dev/assets/01jbbhhtq2jq7mx39dhyq1cfr2.png", "URL")
	res.Path("$.data.updatePropertyValue.propertyField.value").Equal("https://api.visualizer.test.reearth.dev/assets/01jbbhhtq2jq7mx39dhyq1cfr2.png")

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
			"imageUrl":    "https://test.com/project.jpg",
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
	r := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	downloadPath := r.
		Value("data").Object().
		Value("exportProject").Object().
		Value("projectDataPath").String().Raw()
	downloadResponse := e.GET(fmt.Sprintf("http://localhost:8080%s", downloadPath)).
		Expect().
		Status(http.StatusOK).
		Body().Raw()
	fileName := "project_data.zip"
	err := os.WriteFile(fileName, []byte(downloadResponse), os.ModePerm)
	assert.Nil(t, err)
	return fileName
}
