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
