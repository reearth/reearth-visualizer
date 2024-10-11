package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
)

func TestMockAuth(t *testing.T) {
	e := StartServer(t, &config.Config{
		Dev:      true,
		MockAuth: true,
		Origins:  []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, false, nil)

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
	response.Object().ValueEqual("email", "mock@example.com")
	response.Object().ValueEqual("name", "Mock User")
	// userId := response.Object().Value("id").String().Raw()

	// e2 := StartServer(t, &config.Config{
	// 	Dev:      true,
	// 	MockAuth: true,
	// 	MockUser: userId,
	// 	Origins:  []string{"https://example.com"},
	// 	AuthSrv: config.AuthSrvConfig{
	// 		Disabled: true,
	// 	},
	// }, false, nil)

	// requestBody2 := GraphQLRequest{
	// 	OperationName: "GetMe",
	// 	Query:         "query GetMe { \n me { \n id \n name \n email\n } \n}",
	// 	Variables:     map[string]any{},
	// }

	// response2 := e2.POST("/api/graphql").
	// 	WithHeader("Origin", "https://example.com").
	// 	WithHeader("X-Reearth-Debug-User", userId).
	// 	WithHeader("Content-Type", "application/json").
	// 	WithJSON(requestBody2).
	// 	Expect().
	// 	Status(http.StatusOK).
	// 	JSON().
	// 	Object()

	// fmt.Println(response2.Raw())
	// response2.Value("data").Object().Value("me").Object().ContainsKey("id")
	// response2.Value("data").Object().Value("me").Object().Value("name").String().Equal("Expected Name")
	// response2.Value("data").Object().Value("me").Object().Value("email").String().Equal("mock@example.com")
}
