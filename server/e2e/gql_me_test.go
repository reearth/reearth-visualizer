package e2e

import (
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
)

func TestMe(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	},
		true, baseSeeder)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         "query GetMe { \n me { \n id \n name \n email\n } \n}",
		Variables:     map[string]any{},
	}

	Request(e, uID.String(), requestBody).
		Object().
		Value("data").Object().
		Value("me").Object().
		HasValue("email", uEmail).
		HasValue("id", uID.String()).
		HasValue("name", uName)
}
