package config

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestAuth0Config_AuthConfigs(t *testing.T) {
	assert.Equal(t, AuthConfigs{{
		ISS:      "https://hoge.auth0.com/",
		AUD:      []string{"xxx"},
		ClientID: lo.ToPtr("yyy"),
	}}, Auth0Config{
		Domain:   "hoge.auth0.com",
		Audience: "xxx",
		ClientID: "yyy",
	}.Configs())
	assert.Equal(t, AuthConfigs{{
		ISS:      "https://hoge.auth0.com/",
		AUD:      []string{"xxx"},
		ClientID: lo.ToPtr("zzz"),
	}}, Auth0Config{
		Domain:      "hoge.auth0.com",
		Audience:    "xxx",
		WebClientID: "zzz",
	}.Configs())
	assert.Equal(t, AuthConfigs{{
		ISS:      "https://hoge.auth0.com/",
		AUD:      []string{"xxx"},
		ClientID: lo.ToPtr("zzz"),
	}, {
		ISS:      "https://hoge.auth0.com/",
		AUD:      []string{"xxx"},
		ClientID: lo.ToPtr("yyy"),
	}}, Auth0Config{
		Domain:      "hoge.auth0.com/",
		Audience:    "xxx",
		ClientID:    "yyy",
		WebClientID: "zzz",
	}.Configs())
	assert.Nil(t, Auth0Config{
		Domain:   "",
		Audience: "xxx",
		ClientID: "yyy",
	}.Configs())
}
