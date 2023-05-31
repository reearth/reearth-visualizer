package config

import (
	"net/url"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
)

type MarketplaceConfig struct {
	Endpoint string
	Secret   string
	OAuth    *OAuthClientCredentialsConfig
}

type OAuthClientCredentialsConfig struct {
	ClientID     string
	ClientSecret string
	TokenURL     string
	Scopes       []string
	Audience     []string
}

func (c *OAuthClientCredentialsConfig) Config() *clientcredentials.Config {
	if c == nil || c.ClientID == "" || c.ClientSecret == "" || c.TokenURL == "" {
		return nil
	}

	var params url.Values
	if len(c.Audience) > 0 {
		params = url.Values{
			"audience": c.Audience,
		}
	}

	return &clientcredentials.Config{
		ClientID:       c.ClientID,
		ClientSecret:   c.ClientSecret,
		TokenURL:       c.TokenURL,
		Scopes:         c.Scopes,
		AuthStyle:      oauth2.AuthStyleInParams,
		EndpointParams: params,
	}
}
