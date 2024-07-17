package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
)

func TestCreateScene(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	},
		true, baseSeeder)

	requestBody := GraphQLRequest{
		OperationName: "CreateScene",
		Query: `mutation CreateScene($projectId: ID!) {
				createScene( input: {projectId: $projectId} ) { 
					scene { 
						id
						__typename 
					} 
					__typename 
				}
			}`,
		Variables: map[string]any{
			"projectId": pID,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("createScene").Object().
		Value("createScene").Object().
		ValueEqual("id", pID.String())

	sID := res.Path("$.data.createScene.scene.id").Raw().(string)

	assert.NotEmpty(t, sID)

}
