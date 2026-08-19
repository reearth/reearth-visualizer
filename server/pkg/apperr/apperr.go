// Package apperr classifies errors that are expected during normal operation,
// so that logging can tell an operational failure apart from a bad request.
//
// It has to stay free of dependencies on internal packages: both the usecase
// layer (which defines the sentinels) and pkg/visualizer (which logs them)
// import it.
package apperr

import (
	"context"
	"errors"
	"strings"

	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
)

// ErrOperationDenied is returned when the operator is not allowed to perform
// the requested operation. internal/usecase/interfaces and internal/usecase/repo
// both alias this value so that errors.Is matches whichever one was returned.
// It is not treated as expected by IsExpected: denials stay at ERROR.
var ErrOperationDenied = errors.New("operation denied")

// IsExpected reports whether err is an expected failure rather than a defect:
// the caller asked for something that does not exist or sent something
// malformed, or the client went away before the request finished.
//
// Operation denied is deliberately absent. A denial is worth seeing at ERROR:
// repeated denials can be someone probing, and unlike a missing record they say
// something about who is calling.
//
// Callers should log these at WARN. Logging them at ERROR fills the alerting
// channel with noise, most visibly during E2E runs, which exercise every
// negative path on purpose.
func IsExpected(err error) bool {
	if err == nil {
		return false
	}

	switch {
	case errors.Is(err, rerror.ErrNotFound), errors.Is(err, rerror.ErrNotFoundRaw):
		return true
	case errors.Is(err, rerror.ErrAlreadyExists), errors.Is(err, rerror.ErrAlreadyExistsRaw):
		return true
	case errors.Is(err, rerror.ErrInvalidParams), errors.Is(err, rerror.ErrInvalidParamsRaw):
		return true
	case errors.Is(err, idx.ErrInvalidID):
		return true
	case errors.Is(err, context.Canceled):
		// The client disconnected. Nothing on the server went wrong.
		return true
	}

	return false
}

// expectedUpstreamMessages are the failures the accounts API reports for a bad
// request. Anything else it returns (notably "internal") stays an ERROR.
var expectedUpstreamMessages = []string{
	"not found",
	"already exists",
	"invalid params",
	"invalid user name",
	"personal workspace cannot be modified",
	"owner user cannot leave from the workspace",
}

// IsExpectedUpstream reports whether err is an expected failure reported by the
// accounts GraphQL API.
//
// Those errors cross a process boundary as a plain message with no extensions
// (see gqlclient's ReturnAccountsError, which hands back the transport error as
// is), so there is no sentinel left to match on and the message is all we have.
// The type check keeps the matching from reaching errors raised on our side.
func IsExpectedUpstream(err error) bool {
	if err == nil {
		return false
	}

	var (
		list graphql.Errors
		one  graphql.Error
	)
	switch {
	case errors.As(err, &list):
		for _, e := range list {
			if !matchesExpectedUpstream(e.Message) {
				return false
			}
		}
		return len(list) > 0
	case errors.As(err, &one):
		return matchesExpectedUpstream(one.Message)
	}

	return false
}

func matchesExpectedUpstream(message string) bool {
	message = strings.ToLower(message)
	for _, m := range expectedUpstreamMessages {
		if strings.Contains(message, m) {
			return true
		}
	}
	return false
}
