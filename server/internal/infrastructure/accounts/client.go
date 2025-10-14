package accounts

import (
	"net/http"
	"strings"

	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts/user"
	userpkg "github.com/reearth/reearth/server/pkg/user"
)

type Client struct {
	UserRepo userpkg.Repo
}

type authTransport struct {
	token     string
	transport http.RoundTripper
}

func (t *authTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req = req.Clone(req.Context())
	if t.token != "" {
		req.Header.Set("Authorization", "Bearer "+t.token)
	}
	return t.transport.RoundTrip(req)
}

func NewClient(host string, transport http.RoundTripper) *Client {
	httpClient := &http.Client{
		Transport: transport,
	}

	normalizedHost := strings.TrimRight(host, "/")
	fullEndpoint := normalizedHost + "/api/graphql"
	gqlClient := graphql.NewClient(fullEndpoint, httpClient)

	return &Client{
		UserRepo: user.NewRepo(gqlClient),
	}
}
