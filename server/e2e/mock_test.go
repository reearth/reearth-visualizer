package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
)

// go test -v -run TestMockAuth ./e2e/...

func TestMockAuth(t *testing.T) {
	e := StartServer(t, &config.Config{
		Dev:      true,
		MockAuth: true,
		Origins:  []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, nil)

	requestBody := map[string]interface{}{
		"email":    "mock@example.com",
		"username": "Mock User",
	}

	response := e.POST("/api/signup").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	response.Object().ContainsKey("id")
	response.Object().HasValue("email", "mock@example.com")
	response.Object().HasValue("name", "Mock User")
	userId := response.Object().Value("id").String().Raw()

	// checkj query GetMe
	requestBody2 := GraphQLRequest{
		OperationName: "GetMe",
		Query:         "query GetMe { \n me { \n id \n name \n email\n } \n}",
		Variables:     map[string]any{},
	}
	response2 := Request(e, userId, requestBody2).
		Object()

	response2.Value("data").Object().Value("me").Object().ContainsKey("id")
	response2.Value("data").Object().Value("me").Object().Value("name").String().IsEqual("Mock User")
	response2.Value("data").Object().Value("me").Object().Value("email").String().IsEqual("mock@example.com")
}
