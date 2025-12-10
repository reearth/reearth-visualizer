package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReadConfig(t *testing.T) {
	cfg, err := ReadConfig(false)
	assert.NoError(t, err)
	assert.Nil(t, cfg.Auth)
	assert.Equal(t, AuthConfigs{}, cfg.Auths())
	assert.Nil(t, cfg.AuthForWeb())

	t.Setenv("REEARTH_AUTH", `[{"iss":"bar"}]`)
	t.Setenv("REEARTH_AUTH_ISS", "hoge")
	t.Setenv("REEARTH_WEB", "a:1,b:2")
	t.Setenv("REEARTH_WEB_CONFIG", `{"c":3}`)
	cfg, err = ReadConfig(false)
	assert.NoError(t, err)
	assert.Equal(t, AuthConfigs([]AuthConfig{{ISS: "bar"}}), cfg.Auth)
	assert.Equal(t, AuthConfigs{
		{ISS: "hoge"}, // REEARTH_AUTH_*
		{ISS: "bar"},  // REEARTH_AUTH
	}, cfg.Auths())
	assert.Equal(t, "hoge", cfg.Auth_ISS)
	assert.Equal(t, "", cfg.Auth_AUD)
	assert.Equal(t, map[string]any{"a": "1", "b": "2", "c": float64(3)}, cfg.WebConfig())
	assert.Equal(t, &AuthConfig{ISS: "hoge"}, cfg.AuthForWeb())

	t.Setenv("REEARTH_AUTH_AUD", "foo")
	t.Setenv("REEARTH_AUTH", `[{"iss":"bar","aud":["baz"]}]`)
	t.Setenv("REEARTH_WEB", "")
	t.Setenv("REEARTH_AUTH_ISS", "hoge2")
	cfg, err = ReadConfig(false)
	assert.NoError(t, err)
	assert.Equal(t, AuthConfigs{
		{ISS: "hoge2", AUD: []string{"foo"}}, // REEARTH_AUTH_*
		{ISS: "bar", AUD: []string{"baz"}},   // REEARTH_AUTH
	}, cfg.Auths())
	assert.Equal(t, "foo", cfg.Auth_AUD)
	assert.Equal(t, &AuthConfig{ISS: "hoge2", AUD: []string{"foo"}}, cfg.AuthForWeb())
	assert.Equal(t, map[string]string{}, cfg.Web)

	t.Setenv("REEARTH_EXT_PLUGIN", "https://hoge.com/myplugin,https://hoge.com/myplugin2")
	cfg, err = ReadConfig(false)
	assert.NoError(t, err)
	assert.Equal(t, []string{"https://hoge.com/myplugin", "https://hoge.com/myplugin2"}, cfg.Ext_Plugin)
}

func Test_AddHTTPScheme(t *testing.T) {
	assert.Equal(t, "http://a", addHTTPScheme("a"))
	assert.Equal(t, "http://a", addHTTPScheme("http://a"))
	assert.Equal(t, "https://a", addHTTPScheme("https://a"))
}
