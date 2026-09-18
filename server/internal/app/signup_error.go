package app

import (
	"net/http"

	"github.com/reearth/reearth/server/pkg/apperr"
)

// signupErrorStatus maps an error from the accounts service onto the status the
// signup endpoint should answer with. Classification is delegated to pkg/apperr,
// which reads the GraphQL error's own extensions and refuses to downgrade a
// transport or internal failure whose message happens to read like a caller
// mistake. Anything it does not recognise stays a 500, so a genuine server
// fault is never reported as the caller's error.
//
// Every caller error answers 400, an email that is already taken included.
// Signup is public and unauthenticated, so a status that singled that case out
// would tell an unauthenticated caller which addresses are registered.
func signupErrorStatus(err error) int {
	if err == nil {
		return http.StatusOK
	}

	switch apperr.Classify(err) {
	case apperr.ClassInvalidInput, apperr.ClassAlreadyExists, apperr.ClassNotFound, apperr.ClassPermissionDenied:
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}
