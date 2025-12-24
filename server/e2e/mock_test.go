//go:build e2e

package e2e

import (
	"fmt"
	"net/http"
	"testing"
	"time"
)

// go test -v -run TestMockAuth ./e2e/...

func TestMockAuth(t *testing.T) {
	e, _ := ServerMockTest(t)

	// Use unique email and username to avoid conflicts with previous test runs
	timestamp := time.Now().UnixNano()
	email := fmt.Sprintf("mock+%d@example.com", timestamp)
	username := fmt.Sprintf("Mock User %d", timestamp)

	requestBody := map[string]interface{}{
		"email":    email,
		"username": username,
	}

	response := e.POST("/api/signup").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	response.Object().ContainsKey("id")
	response.Object().HasValue("email", email)
	response.Object().HasValue("name", username)
	userId := response.Object().Value("id").String().Raw()

	// check query GetMe
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
	response2.Value("data").Object().Value("me").Object().Value("name").String().IsEqual(username)
	response2.Value("data").Object().Value("me").Object().Value("email").String().IsEqual(email)
}
