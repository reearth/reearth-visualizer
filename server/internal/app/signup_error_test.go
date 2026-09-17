package app

import (
	"errors"
	"net/http"
	"testing"

	graphql "github.com/hasura/go-graphql-client"
	"github.com/stretchr/testify/assert"
)

func gqlErr(message string, ext map[string]any) graphql.Errors {
	if ext == nil {
		ext = map[string]any{}
	}
	return graphql.Errors{{Message: message, Extensions: ext}}
}

func TestSignupErrorStatus(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want int
	}{
		{"nil", nil, http.StatusOK},

		{"invalid email", gqlErr("input: signup invalid email", nil), http.StatusBadRequest},
		{"invalid user name", gqlErr("input: signup invalid user name", nil), http.StatusBadRequest},
		{"invalid password", gqlErr("input: signup invalid password", nil), http.StatusBadRequest},
		{"invalid secret", gqlErr("input: signup invalid secret", nil), http.StatusBadRequest},
		{"password too short", gqlErr("input: signup password at least 8 characters", nil), http.StatusBadRequest},
		{"password needs a number", gqlErr("input: signup password should have numbers", nil), http.StatusBadRequest},

		{"already exists", gqlErr("input: signup user already exists", nil), http.StatusConflict},

		// A failure that never reached a resolver is the server's problem, even
		// when its text reads like a caller mistake.
		{"transport failure", gqlErr(`Variable "$id" is not defined.`, map[string]any{"code": graphql.ErrRequestError}), http.StatusInternalServerError},
		{"internal extension", gqlErr("invalid email", map[string]any{"internal": "boom"}), http.StatusInternalServerError},
		{"internal in message", gqlErr("internal error: invalid email", nil), http.StatusInternalServerError},

		{"transaction failure", gqlErr("input: signup transaction error", nil), http.StatusInternalServerError},
		{"connection refused", errors.New("dial tcp: connection refused"), http.StatusInternalServerError},
		{"unknown", errors.New("something went wrong"), http.StatusInternalServerError},

		// An unstructured error carries nothing to classify safely, so it is
		// treated as a defect rather than matched on its text.
		{"bare string that reads like a rejection", errors.New("input: signup invalid email"), http.StatusInternalServerError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, signupErrorStatus(tt.err))
		})
	}
}
