package e2e

import (
	"net/http"
	"testing"
)

func TestMe(t *testing.T) {
	e := Server(t, baseSeeder)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         "query GetMe { \n me { \n id \n name \n email\n } \n}",
		Variables:     map[string]any{},
	}

	e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		// WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("me").Object().
		ValueEqual("email", uEmail).
		ValueEqual("id", uID.String()).
		ValueEqual("name", uName)
}
