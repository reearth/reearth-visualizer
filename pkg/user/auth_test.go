package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAuthFromAuth0Sub(t *testing.T) {
	testCases := []struct {
		Name, Sub string
		Expected  Auth
	}{
		{
			Name: "Create Auth",
			Sub:  "xx|yy",
			Expected: Auth{
				Provider: "xx",
				Sub:      "yy",
			},
		},
		{
			Name:     "Create empty Auth",
			Sub:      "",
			Expected: Auth{},
		},
	}
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected, AuthFromAuth0Sub(tc.Sub))
		})
	}
}

func TestAuth_IsAuth0(t *testing.T) {
	testCases := []struct {
		Name     string
		Auth     Auth
		Expected bool
	}{
		{
			Name: "is Auth",
			Auth: Auth{
				Provider: "auth0",
				Sub:      "xxx",
			},
			Expected: true,
		},
		{
			Name: "is not Auth",
			Auth: Auth{
				Provider: "foo",
				Sub:      "hoge",
			},
			Expected: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.Expected, tc.Auth.IsAuth0())
		})
	}
}
