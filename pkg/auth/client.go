package auth

import (
	"fmt"
	"time"

	"github.com/caos/oidc/pkg/oidc"
	"github.com/caos/oidc/pkg/op"
)

const ClientID = "01FH69GFQ4DFCXS5XD91JK4HZ1"

type Client struct {
	id                 string
	applicationType    op.ApplicationType
	authMethod         oidc.AuthMethod
	accessTokenType    op.AccessTokenType
	responseTypes      []oidc.ResponseType
	grantTypes         []oidc.GrantType
	allowedScopes      []string
	redirectURIs       []string
	logoutRedirectURIs []string
	loginURI           string
	idTokenLifetime    time.Duration
	clockSkew          time.Duration
	devMode            bool
}

func NewLocalClient(devMode bool, clientDomain string) op.Client {
	return &Client{
		id:              ClientID,
		applicationType: op.ApplicationTypeWeb,
		authMethod:      oidc.AuthMethodNone,
		accessTokenType: op.AccessTokenTypeJWT,
		responseTypes:   []oidc.ResponseType{oidc.ResponseTypeCode},
		grantTypes:      []oidc.GrantType{oidc.GrantTypeCode, oidc.GrantTypeRefreshToken},
		redirectURIs:    []string{clientDomain},
		allowedScopes:   []string{"openid", "profile", "email"},
		loginURI:        clientDomain + "/login?id=%s",
		idTokenLifetime: 5 * time.Minute,
		clockSkew:       0,
		devMode:         devMode,
	}
}

func (c *Client) GetID() string {
	return c.id
}

func (c *Client) RedirectURIs() []string {
	return c.redirectURIs
}

func (c *Client) PostLogoutRedirectURIs() []string {
	return c.logoutRedirectURIs
}

func (c *Client) LoginURL(id string) string {
	return fmt.Sprintf(c.loginURI, id)
}

func (c *Client) ApplicationType() op.ApplicationType {
	return c.applicationType
}

func (c *Client) AuthMethod() oidc.AuthMethod {
	return c.authMethod
}

func (c *Client) IDTokenLifetime() time.Duration {
	return c.idTokenLifetime
}

func (c *Client) AccessTokenType() op.AccessTokenType {
	return c.accessTokenType
}

func (c *Client) ResponseTypes() []oidc.ResponseType {
	return c.responseTypes
}

func (c *Client) GrantTypes() []oidc.GrantType {
	return c.grantTypes
}

func (c *Client) DevMode() bool {
	return c.devMode
}

func (c *Client) RestrictAdditionalIdTokenScopes() func(scopes []string) []string {
	return func(scopes []string) []string {
		return scopes
	}
}

func (c *Client) RestrictAdditionalAccessTokenScopes() func(scopes []string) []string {
	return func(scopes []string) []string {
		return scopes
	}
}

func (c *Client) IsScopeAllowed(scope string) bool {
	for _, clientScope := range c.allowedScopes {
		if clientScope == scope {
			return true
		}
	}
	return false
}

func (c *Client) IDTokenUserinfoClaimsAssertion() bool {
	return false
}

func (c *Client) ClockSkew() time.Duration {
	return c.clockSkew
}
