package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
)

// go test -v -run TestExportProject ./e2e/...

func TestCallExportProject(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	requestBody := GraphQLRequest{
		OperationName: "ExportProject",
		Query:         "mutation ExportProject($projectId: ID!) { exportProject(input: {projectId: $projectId}) { projectData __typename } }",
		Variables: map[string]any{
			"projectId": pID.String(),
		},
	}

	response := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect()

	response.Status(http.StatusOK)

	response.JSON().
		Object().
		Value("data").Object().
		Value("exportProject").Object().
		Value("projectData").Object()

}

// go test -v -run TestImportProject ./e2e/...

func TestCallImportProject(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	testFilePath := "project.json"

	response := e.POST("/api/graphql").
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
		Expect()

	response.Status(http.StatusOK)

	response.JSON().
		Object().
		Value("data").Object().
		Value("exportProject").Object().
		Value("projectData").Object()

}
