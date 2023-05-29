package config

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/samber/lo"
)

type AuthConfig struct {
	ISS      string
	AUD      []string
	ALG      *string
	TTL      *int
	ClientID *string
	JWKSURI  *string
}

type AuthConfigs []AuthConfig

// Decode is a custom decoder for AuthConfigs
func (ipd *AuthConfigs) Decode(value string) error {
	if value == "" {
		return nil
	}

	var providers []AuthConfig

	err := json.Unmarshal([]byte(value), &providers)
	if err != nil {
		return fmt.Errorf("invalid identity providers json: %w", err)
	}

	*ipd = providers
	return nil
}

type Auth0Config struct {
	Domain       string
	Audience     string
	ClientID     string
	ClientSecret string
	WebClientID  string
}

func (c Auth0Config) AuthConfigForWeb() *AuthConfig {
	if c.Domain == "" || c.WebClientID == "" {
		return nil
	}
	domain := prepareUrl(c.Domain)
	var aud []string
	if len(c.Audience) > 0 {
		aud = []string{c.Audience}
	}
	return &AuthConfig{
		ISS:      domain,
		AUD:      aud,
		ClientID: &c.WebClientID,
	}
}

func (c Auth0Config) AuthConfigForM2M() *AuthConfig {
	if c.Domain == "" || c.ClientID == "" {
		return nil
	}
	domain := prepareUrl(c.Domain)
	var aud []string
	if len(c.Audience) > 0 {
		aud = []string{c.Audience}
	}
	return &AuthConfig{
		ISS:      domain,
		AUD:      aud,
		ClientID: &c.ClientID,
	}
}

func (c Auth0Config) AuthConfigs() (res []AuthConfig) {
	if c := c.AuthConfigForWeb(); c != nil {
		res = append(res, *c)
	}
	if c := c.AuthConfigForM2M(); c != nil {
		res = append(res, *c)
	}
	return
}

type CognitoConfig struct {
	UserPoolID string
	Region     string
	ClientID   string
}

func (c CognitoConfig) AuthConfig() *AuthConfig {
	if c.UserPoolID == "" || c.Region == "" || c.ClientID == "" {
		return nil
	}
	return &AuthConfig{
		ISS:      fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s", c.Region, c.UserPoolID),
		AUD:      []string{c.ClientID},
		ClientID: &c.ClientID,
		JWKSURI:  lo.ToPtr(fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", c.Region, c.UserPoolID)),
	}
}

func prepareUrl(url string) string {
	if !strings.HasPrefix(url, "https://") && !strings.HasPrefix(url, "http://") {
		url = "https://" + url
	}
	url = strings.TrimSuffix(url, "/")
	return url
}
