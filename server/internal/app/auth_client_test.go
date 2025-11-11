package app

import (
	"bytes"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsSignupMutation(t *testing.T) {
	t.Run("should detect signup mutations", func(t *testing.T) {
		t.Run("signup mutation with operation name", func(t *testing.T) {
			body := `{"query":"mutation SignupUser($input: SignupInput!) { signup(input: $input) { user { id } } }"}`
			req, err := http.NewRequest(http.MethodPost, "/api/graphql", io.NopCloser(bytes.NewBufferString(body)))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.True(t, result)
		})

		t.Run("signup mutation without operation name", func(t *testing.T) {
			body := `{"query":"mutation { signup(input: $input) { user { id } } }"}`
			req, err := http.NewRequest(http.MethodPost, "/api/graphql", io.NopCloser(bytes.NewBufferString(body)))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.True(t, result)
		})

		t.Run("signupOIDC mutation", func(t *testing.T) {
			body := `{"query":"mutation { signupOIDC(input: $input) { user { id } } }"}`
			req, err := http.NewRequest(http.MethodPost, "/api/graphql", io.NopCloser(bytes.NewBufferString(body)))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.True(t, result)
		})

		t.Run("signup mutation with whitespace and newlines", func(t *testing.T) {
			body := `{"query":"mutation {\n  signup(input: $input) {\n    user { id }\n  }\n}"}`
			req, err := http.NewRequest(http.MethodPost, "/api/graphql", io.NopCloser(bytes.NewBufferString(body)))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.True(t, result)
		})
	})

	t.Run("should not detect non-signup operations", func(t *testing.T) {
		t.Run("other mutation", func(t *testing.T) {
			body := `{"query":"mutation { updateMe(input: $input) { me { id } } }"}`
			req, err := http.NewRequest(http.MethodPost, "/api/graphql", io.NopCloser(bytes.NewBufferString(body)))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.False(t, result)
		})

		t.Run("query operation", func(t *testing.T) {
			body := `{"query":"query { me { id } }"}`
			req, err := http.NewRequest(http.MethodPost, "/api/graphql", io.NopCloser(bytes.NewBufferString(body)))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.False(t, result)
		})

		t.Run("GET request with signup mutation", func(t *testing.T) {
			body := `{"query":"mutation { signup(input: $input) { user { id } } }"}`
			req, err := http.NewRequest(http.MethodGet, "/api/graphql", io.NopCloser(bytes.NewBufferString(body)))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.False(t, result)
		})

		t.Run("invalid JSON body", func(t *testing.T) {
			body := `invalid json`
			req, err := http.NewRequest(http.MethodPost, "/api/graphql", io.NopCloser(bytes.NewBufferString(body)))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.False(t, result)
		})

		t.Run("empty body", func(t *testing.T) {
			req, err := http.NewRequest(http.MethodPost, "/api/graphql", io.NopCloser(bytes.NewBufferString("")))
			assert.NoError(t, err)

			result := isSignupMutation(req)
			assert.False(t, result)
		})
	})
}
