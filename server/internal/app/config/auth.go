package config

import (
	"encoding/json"
	"fmt"

	"github.com/reearth/reearthx/appx"
	"github.com/samber/lo"
)

type AuthConfig struct {
	ISS      string   `pp:",omitempty"`
	AUD      []string `pp:",omitempty"`
	ALG      *string  `pp:",omitempty"`
	TTL      *int     `pp:",omitempty"`
	ClientID *string  `pp:",omitempty"`
	JWKSURI  *string  `pp:",omitempty"`
}

func (a AuthConfig) JWTProvider() appx.JWTProvider {
	return appx.JWTProvider{
		ISS:     a.ISS,
		AUD:     a.AUD,
		ALG:     a.ALG,
		TTL:     a.TTL,
		JWKSURI: a.JWKSURI,
	}
}

type AuthConfigs []AuthConfig

type AuthProvider interface {
	Configs() AuthConfigs
}

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

func (a AuthConfigs) JWTProviders() []appx.JWTProvider {
	return lo.Map(a, func(a AuthConfig, _ int) appx.JWTProvider { return a.JWTProvider() })
}

type CognitoConfig struct {
	UserPoolID string `pp:",omitempty"`
	Region     string `pp:",omitempty"`
	ClientID   string `pp:",omitempty"`
}

func (c CognitoConfig) Configs() AuthConfigs {
	if c.UserPoolID == "" || c.Region == "" || c.ClientID == "" {
		return nil
	}
	return AuthConfigs{
		AuthConfig{
			ISS:      fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s", c.Region, c.UserPoolID),
			AUD:      []string{c.ClientID},
			ClientID: &c.ClientID,
			JWKSURI:  lo.ToPtr(fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", c.Region, c.UserPoolID)),
		},
	}
}
