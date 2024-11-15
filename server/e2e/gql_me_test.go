package e2e

import (
	"testing"
)

func TestMe(t *testing.T) {
	e := Server(t)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         "query GetMe { \n me { \n id \n name \n email\n } \n}",
		Variables:     map[string]any{},
	}

	Request(e, uID.String(), requestBody).
		Object().
		Value("data").Object().
		Value("me").Object().
		ValueEqual("email", uEmail).
		ValueEqual("id", uID.String()).
		ValueEqual("name", uName)
}
