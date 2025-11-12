package accounts

import (
	"net/http"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearthx/log"
)

type dynamicAuthTransport struct {
	transport *gqlclient.AccountsTransport
}

func NewDynamicAuthTransport() *dynamicAuthTransport {
	return &dynamicAuthTransport{
		transport: gqlclient.NewAccountsTransport(
			http.DefaultTransport,
			gqlclient.InternalServiceVisualizerAPI,
		),
	}
}

func (t dynamicAuthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	var token string

	// During the migration period to accounts server, this transport handles both:
	// - JWT tokens set directly in context (new auth middleware)
	// - JWT tokens extracted from AuthInfo (legacy auth middleware)
	// TODO: Remove authInfo handling once the migration is complete
	if jwtToken := adapter.JwtToken(req.Context()); jwtToken != "" {
		token = jwtToken
	}

	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := t.transport.RoundTrip(req)
	if err != nil {
		log.Errorfc(req.Context(), "[Accounts API] Request failed: %v", err)
		return nil, err
	}

	return resp, nil
}
