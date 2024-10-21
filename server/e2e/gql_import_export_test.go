package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
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
		Query:         "mutation ExportProject($projectId: ID!) { exportProject(input: {projectId: $projectId}) { projectDataPath __typename } }",
		Variables: map[string]any{
			"projectId": pID,
		},
	}

	e.POST("/api/graphql").
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

	// downloadResponse := e.GET(fmt.Sprintf("http://localhost:8080%s", projectDataPath)).
	// 	Expect().
	// 	Status(http.StatusOK).
	// 	Body()
	// fmt.Println(downloadResponse)
}
