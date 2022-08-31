package user

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"golang.org/x/exp/slices"

	"github.com/stretchr/testify/assert"
)

func TestAuthFromAuth0Sub(t *testing.T) {
	tests := []struct {
		Name, Sub string
		Expected  Auth
	}{
		{
			Name: "with provider",
			Sub:  "xx|yy",
			Expected: Auth{
				Provider: "xx",
				Sub:      "xx|yy",
			},
		},
		{
			Name: "without provider",
			Sub:  "yy",
			Expected: Auth{
				Provider: "",
				Sub:      "yy",
			},
		},
		{
			Name:     "empty",
			Sub:      "",
			Expected: Auth{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, AuthFrom(tc.Sub))
		})
	}
}

func TestAuth_IsAuth0(t *testing.T) {
	assert.True(t, Auth{Provider: "auth0", Sub: "xxx"}.IsAuth0())
	assert.False(t, Auth{Provider: "reearth", Sub: "xxx"}.IsAuth0())
}

func TestAuth_IsReearth(t *testing.T) {
	assert.True(t, Auth{Provider: "reearth", Sub: "xxx"}.IsReearth())
	assert.False(t, Auth{Provider: "auth0", Sub: "xxx"}.IsReearth())
}

func TestNewReearthAuth(t *testing.T) {
	uid := id.NewUserID()

	tests := []struct {
		name  string
		input string
		want  Auth
	}{
		{
			name:  "should return reearth sub",
			input: uid.String(),
			want: Auth{
				Provider: "reearth",
				Sub:      "reearth|" + uid.String(),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewReearthAuth(tt.input)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestAuths(t *testing.T) {
	auths := Auths{
		{Provider: "x", Sub: "a"},
		{Provider: "y", Sub: "b"},
	}

	assert.True(t, auths.Has("a"))
	assert.False(t, auths.Has("y"))
	assert.True(t, auths.HasProvider("x"))
	assert.False(t, auths.HasProvider("b"))
	assert.Equal(t, &Auth{Provider: "y", Sub: "b"}, auths.Get("b"))
	assert.Nil(t, auths.Get("x"))
	assert.Equal(t, &Auth{Provider: "x", Sub: "a"}, auths.GetByProvider("x"))
	assert.Nil(t, auths.GetByProvider("b"))
	assert.Equal(t, append(auths, Auth{Provider: "z", Sub: "c"}), auths.Add(Auth{Provider: "z", Sub: "c"}))
	assert.Equal(t, auths, auths.Add(Auth{Provider: "z", Sub: "a"}))
	assert.Equal(t, Auths{{Provider: "y", Sub: "b"}}, slices.Clone(auths).Remove("a"))
	assert.Equal(t, auths, auths.Remove("c"))
	assert.Equal(t, Auths{{Provider: "y", Sub: "b"}}, auths.RemoveByProvider("x"))
	assert.Equal(t, auths, auths.RemoveByProvider("z"))
}
