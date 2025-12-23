//go:build e2e

package e2e

import (
	"net/http"
	"testing"
)

// go test -v -run TestMockAuth ./e2e/...

func TestMockAuth(t *testing.T) {
	e, _ := ServerMockTest(t)

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
		Query: `query GetMe {
 me {
 id
 name
 email
 }
}`,
		Variables: map[string]any{},
	}
	response2 := Request(e, userId, requestBody2).
		Object()

	response2.Value("data").Object().Value("me").Object().ContainsKey("id")
	response2.Value("data").Object().Value("me").Object().Value("name").String().IsEqual("Mock User")
	response2.Value("data").Object().Value("me").Object().Value("email").String().IsEqual("mock@example.com")
}
