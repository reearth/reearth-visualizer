package app

import (
	"errors"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSignupErrorStatus(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want int
	}{
		{"nil", nil, http.StatusOK},

		// As the accounts service actually reports them, wrapped by the
		// gqlclient: "input: <mutation> <message>".
		{"invalid email", errors.New("input: signup invalid email"), http.StatusBadRequest},
		{"invalid user name", errors.New("input: signup invalid user name"), http.StatusBadRequest},
		{"invalid password", errors.New("input: signup invalid password"), http.StatusBadRequest},
		{"invalid secret", errors.New("input: signup invalid secret"), http.StatusBadRequest},
		{"password too short", errors.New("input: signup password at least 8 characters"), http.StatusBadRequest},
		{"password needs upper", errors.New("input: signup password should have upper case letters"), http.StatusBadRequest},
		{"password needs lower", errors.New("input: signup password should have lower case letters"), http.StatusBadRequest},
		{"password needs number", errors.New("input: signup password should have numbers"), http.StatusBadRequest},

		{"already exists", errors.New("input: signup user already exists"), http.StatusConflict},

		// Anything we do not recognise has to stay a server error rather than
		// be blamed on the caller.
		{"transaction failure", errors.New("input: signup transaction error"), http.StatusInternalServerError},
		{"connection failure", errors.New("Post \"http://accounts/api/graphql\": dial tcp: connection refused"), http.StatusInternalServerError},
		{"unknown", errors.New("something went wrong"), http.StatusInternalServerError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, signupErrorStatus(tt.err))
		})
	}
}

func TestSignupErrorStatusIsCaseInsensitive(t *testing.T) {
	assert.Equal(t, http.StatusBadRequest, signupErrorStatus(errors.New("Input: signup Invalid Email")))
}
