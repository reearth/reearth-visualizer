package app

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAuth0Config_AuthConfig(t *testing.T) {
	s := ""
	assert.Equal(t, &AuthConfig{
		ISS:      "https://hoge.auth0.com",
		AUD:      []string{"xxx"},
		ClientID: &s,
	}, Auth0Config{
		Domain:   "hoge.auth0.com/",
		Audience: "xxx",
	}.AuthConfig())
	assert.Nil(t, Auth0Config{
		Domain:   "",
		Audience: "xxx",
	}.AuthConfig())
}

func TestReadConfig(t *testing.T) {
	clientID := authServerDefaultClientID
	localAuth := AuthConfig{
		ISS:      "http://localhost:8080",
		AUD:      []string{"http://localhost:8080"},
		ClientID: &clientID,
	}

	cfg, err := ReadConfig(false)
	assert.NoError(t, err)
	assert.Nil(t, cfg.Auth)
	assert.Equal(t, []AuthConfig{localAuth}, cfg.Auths())

	t.Setenv("REEARTH_AUTH", `[{"iss":"bar"}]`)
	t.Setenv("REEARTH_AUTH_ISS", "hoge")
	cfg, err = ReadConfig(false)
	assert.NoError(t, err)
	assert.Equal(t, AuthConfigs([]AuthConfig{{ISS: "bar"}}), cfg.Auth)
	assert.Equal(t, []AuthConfig{
		{ISS: "hoge"}, // REEARTH_AUTH_*
		localAuth,     // local auth srv
		{ISS: "bar"},  // REEARTH_AUTH
	}, cfg.Auths())
	assert.Equal(t, "hoge", cfg.Auth_ISS)
	assert.Equal(t, "", cfg.Auth_AUD)

	t.Setenv("REEARTH_AUTH_AUD", "foo")
	t.Setenv("REEARTH_AUTH0_DOMAIN", "foo")
	t.Setenv("REEARTH_AUTH0_CLIENTID", clientID)
	cfg, err = ReadConfig(false)
	assert.NoError(t, err)
	assert.Equal(t, []AuthConfig{
		{ISS: "https://foo", ClientID: &clientID}, // Auth0
		{ISS: "hoge", AUD: []string{"foo"}},       // REEARTH_AUTH_*
		localAuth,                                 // local auth srv
		{ISS: "bar"},                              // REEARTH_AUTH
	}, cfg.Auths())
	assert.Equal(t, "foo", cfg.Auth_AUD)
}

func Test_AddHTTPScheme(t *testing.T) {
	assert.Equal(t, "http://a", addHTTPScheme("a"))
	assert.Equal(t, "http://a", addHTTPScheme("http://a"))
	assert.Equal(t, "https://a", addHTTPScheme("https://a"))
}
