package user

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"

	"github.com/stretchr/testify/assert"
)

func TestAuthFromAuth0Sub(t *testing.T) {
	tests := []struct {
		Name, Sub string
		Expected  Auth
	}{
		{
			Name: "Create Auth",
			Sub:  "xx|yy",
			Expected: Auth{
				Provider: "xx",
				Sub:      "xx|yy",
			},
		},
		{
			Name:     "Create empty Auth",
			Sub:      "",
			Expected: Auth{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, AuthFromAuth0Sub(tc.Sub))
		})
	}
}

func TestAuth_IsAuth0(t *testing.T) {
	tests := []struct {
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

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.Auth.IsAuth0())
		})
	}
}

func TestGenReearthSub(t *testing.T) {
	uid := id.NewUserID()

	tests := []struct {
		name  string
		input string
		want  *Auth
	}{
		{
			name:  "should return reearth sub",
			input: uid.String(),
			want: &Auth{
				Provider: "reearth",
				Sub:      "reearth|" + uid.String(),
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := GenReearthSub(tt.input)
			assert.Equal(t, tt.want, got)
		})
	}
}
