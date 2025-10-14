package accounts

import (
	"net/http"

	"github.com/reearth/reearth/server/internal/adapter/internal"
	"github.com/reearth/reearthx/log"
)

type DynamicAuthTransport struct{}

func (t DynamicAuthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	var token string

	// During the migration period to accounts server, this transport handles both:
	// - JWT tokens set directly in context (new auth middleware)
	// - JWT tokens extracted from AuthInfo (legacy auth middleware)
	// TODO: Remove authInfo handling once the migration is complete
	if jwtToken := internal.GetContextJWT(req.Context()); jwtToken != "" {
		token = jwtToken
	} else if authInfo := internal.GetContextAuthInfo(req.Context()); authInfo != nil && authInfo.Token != "" {
		token = authInfo.Token
	}

	log.Debugfc(req.Context(), "accounts API: token: %s", token)

	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	return http.DefaultTransport.RoundTrip(req)
}
