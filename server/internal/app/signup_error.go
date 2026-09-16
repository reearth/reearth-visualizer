package app

import (
	"net/http"
	"strings"
)

// signupClientErrors are the accounts service errors that a signup caller
// causes and can correct. The gqlclient flattens GraphQL errors to a plain
// string before we see them, and the accounts schema attaches no error code to
// these, so the message is the only signal available. Matching is therefore on
// the message text, taken from the error values the accounts package exports.
var signupClientErrors = []string{
	"invalid email",
	"invalid user name",
	"invalid password",
	"invalid secret",
	"password at least 8 characters",
	"password should have upper case letters",
	"password should have lower case letters",
	"password should have numbers",
}

// signupErrorStatus maps an error from the accounts service onto the status the
// signup endpoint should answer with. An unrecognised error stays a 500, so a
// genuine server fault is never reported as the caller's mistake.
func signupErrorStatus(err error) int {
	if err == nil {
		return http.StatusOK
	}

	msg := strings.ToLower(err.Error())

	if strings.Contains(msg, "user already exists") {
		return http.StatusConflict
	}

	for _, e := range signupClientErrors {
		if strings.Contains(msg, e) {
			return http.StatusBadRequest
		}
	}

	return http.StatusInternalServerError
}
