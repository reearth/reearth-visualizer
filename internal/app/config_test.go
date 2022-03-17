package app

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAuth0Config_AuthConfig(t *testing.T) {
	assert.Equal(t, &AuthConfig{
		ISS: "https://hoge.auth0.com/",
		AUD: []string{"xxx"},
	}, Auth0Config{
		Domain:   "hoge.auth0.com",
		Audience: "xxx",
	}.AuthConfig())
	assert.Nil(t, Auth0Config{
		Domain:   "",
		Audience: "xxx",
	}.AuthConfig())
}

func TestReadConfig(t *testing.T) {
	t.Setenv("REEARTH_AUTH", `[{"iss":"bar"}]`)
	t.Setenv("REEARTH_AUTH_ISS", "hoge")
	t.Setenv("REEARTH_AUTH_AUD", "foo")
	cfg, err := ReadConfig(false)
	assert.NoError(t, err)
	assert.Equal(t, AuthConfigs([]AuthConfig{{ISS: "bar"}}), cfg.Auth)
	assert.Equal(t, "hoge", cfg.Auth_ISS)
	assert.Equal(t, "foo", cfg.Auth_AUD)
}
