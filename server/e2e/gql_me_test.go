package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app"
)

func TestMe(t *testing.T) {
	e := StartServer(t, &app.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: app.AuthSrvConfig{
			Disabled: true,
		},
	},
		true, baseSeeder)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         "query GetMe { \n me { \n id \n name \n email\n } \n}",
		Variables:     map[string]any{},
	}

	e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		// WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uId.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("me").Object().
		ValueEqual("email", uEmail).
		ValueEqual("id", uId.String()).
		ValueEqual("name", uName)
}
