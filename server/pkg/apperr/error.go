// Package apperr is a typed application error carrying an ErrorClass, modelled
// on centrifugo's error taxonomy (github.com/centrifugal/centrifuge/errors.go):
// the error value carries its own category rather than being classified after
// the fact.
//
// The ErrorClass drives the logging severity from one place
// (ErrorClass.Expected): expected failures log at WARN so they do not page the
// alerting channel; genuine defects stay at ERROR. Permission denials count as
// expected (WARN): in practice they are legitimate users reaching resources
// they cannot access, not attacks worth paging on. ErrorClass.String is a
// stable, machine-readable code suitable for GraphQL extensions "code" and
// metric labels, and leaves room for more axes later (e.g. a Temporary flag)
// without touching call sites.
//
// Our own code can return these directly (apperr.NotFound(...)). Errors that
// arrive from packages we do not own — reearthx rerror, idx, the accounts
// GraphQL client, stdlib context — are mapped at the boundary by Classify, so
// the logging layer can read an ErrorClass off any error.
//
// This package must not import internal packages: the usecase layer and
// pkg/visualizer both depend on it.
package apperr

import (
	"context"
	"errors"
	"strings"

	graphql "github.com/hasura/go-graphql-client"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
)

// ErrOperationDenied is returned when the operator is not allowed to perform
// the requested operation. internal/usecase/interfaces and internal/usecase/repo
// both alias this value so that errors.Is matches whichever one was returned,
// and Classify maps it to ClassPermissionDenied.
var ErrOperationDenied = errors.New("operation denied")

// ErrorClass is the category of an application error.
type ErrorClass int

const (
	// ClassUnexpected is a defect: something the server got wrong. Logged at
	// ERROR. This is the zero value, so an unclassified error is treated as a
	// defect, which is the safe default.
	ClassUnexpected ErrorClass = iota
	// ClassNotFound: the requested resource does not exist.
	ClassNotFound
	// ClassAlreadyExists: the resource already exists / a uniqueness conflict.
	ClassAlreadyExists
	// ClassInvalidInput: the request was malformed or violated a business rule.
	ClassInvalidInput
	// ClassPermissionDenied: the caller is not allowed to do this.
	ClassPermissionDenied
	// ClassCanceled: the client went away before the request finished.
	ClassCanceled
)

// className is the stable machine-readable code per class, surfaced to clients
// (GraphQL extensions "code") and usable as a metric label. No invented numeric
// scheme: the name is the code.
var className = map[ErrorClass]string{
	ClassUnexpected:       "internal",
	ClassNotFound:         "not_found",
	ClassAlreadyExists:    "already_exists",
	ClassInvalidInput:     "invalid_input",
	ClassPermissionDenied: "permission_denied",
	ClassCanceled:         "canceled",
}

// String returns the machine-readable code for the class.
func (c ErrorClass) String() string {
	if s, ok := className[c]; ok {
		return s
	}
	return "internal"
}

// Expected reports whether this class is a normal outcome rather than a defect.
// Expected classes are logged at WARN; the rest stay at ERROR. This is the one
// place the policy lives: to move denials to WARN later, change this table, not
// the call sites.
func (c ErrorClass) Expected() bool {
	switch c {
	case ClassNotFound, ClassAlreadyExists, ClassInvalidInput, ClassPermissionDenied, ClassCanceled:
		return true
	default: // ClassUnexpected
		return false
	}
}

// Error is a typed application error. Err is the wrapped cause, if any, so
// errors.Is/As keep working through it.
type Error struct {
	Class   ErrorClass
	Message string
	Err     error
}

func (e *Error) Error() string {
	switch {
	case e.Message != "" && e.Err != nil:
		return e.Message + ": " + e.Err.Error()
	case e.Message != "":
		return e.Message
	case e.Err != nil:
		return e.Err.Error()
	default:
		return e.Class.String()
	}
}

func (e *Error) Unwrap() error { return e.Err }

// New builds an Error of the given class wrapping cause (which may be nil).
func New(class ErrorClass, message string, cause error) *Error {
	return &Error{Class: class, Message: message, Err: cause}
}

// Constructors for the common classes. Prefer these at the point of failure.
func NotFound(message string, cause error) *Error {
	return New(ClassNotFound, message, cause)
}
func AlreadyExists(message string, cause error) *Error {
	return New(ClassAlreadyExists, message, cause)
}
func InvalidInput(message string, cause error) *Error {
	return New(ClassInvalidInput, message, cause)
}
func PermissionDenied(message string, cause error) *Error {
	return New(ClassPermissionDenied, message, cause)
}

// Classify returns the ErrorClass of any error: the ErrorClass carried by an
// *apperr.Error, or the ErrorClass inferred from a foreign error at the
// boundary. Unclassifiable errors are ClassUnexpected, so they stay at ERROR.
func Classify(err error) ErrorClass {
	if err == nil {
		return ClassUnexpected
	}

	// Our own typed error carries its class directly.
	var ae *Error
	if errors.As(err, &ae) {
		return ae.Class
	}

	// Foreign sentinels we consume but do not mint.
	switch {
	case errors.Is(err, rerror.ErrNotFound), errors.Is(err, rerror.ErrNotFoundRaw):
		return ClassNotFound
	case errors.Is(err, rerror.ErrAlreadyExists), errors.Is(err, rerror.ErrAlreadyExistsRaw):
		return ClassAlreadyExists
	case errors.Is(err, rerror.ErrInvalidParams), errors.Is(err, rerror.ErrInvalidParamsRaw), errors.Is(err, idx.ErrInvalidID):
		return ClassInvalidInput
	case errors.Is(err, ErrOperationDenied):
		return ClassPermissionDenied
	case errors.Is(err, context.Canceled):
		return ClassCanceled
	}

	// Accounts GraphQL errors cross the process boundary as a plain message
	// with no code, so the message is all there is to match on. The type check
	// keeps this from reaching errors raised on our side.
	if c, ok := classifyUpstream(err); ok {
		return c
	}

	return ClassUnexpected
}

// Expected is a convenience over Classify(err).Expected().
func Expected(err error) bool { return Classify(err).Expected() }

// upstreamMessages maps a substring of an accounts-API error message to a
// class. Anything not listed (notably "internal") falls through to
// ClassUnexpected.
var upstreamMessages = []struct {
	substr string
	class  ErrorClass
}{
	{"not found", ClassNotFound},
	{"already exists", ClassAlreadyExists},
	{"invalid params", ClassInvalidInput},
	{"invalid user name", ClassInvalidInput},
	{"personal workspace cannot be modified", ClassInvalidInput},
	{"owner user cannot leave from the workspace", ClassInvalidInput},
	{"operation denied", ClassPermissionDenied},
}

func classifyUpstream(err error) (ErrorClass, bool) {
	var (
		list graphql.Errors
		one  graphql.Error
	)
	switch {
	case errors.As(err, &list):
		if len(list) == 0 {
			return ClassUnexpected, false
		}
		// Every entry must be the same class; a mixed list is a defect.
		first, ok := matchUpstream(list[0].Message)
		if !ok {
			return ClassUnexpected, false
		}
		for _, e := range list[1:] {
			if c, ok := matchUpstream(e.Message); !ok || c != first {
				return ClassUnexpected, false
			}
		}
		return first, true
	case errors.As(err, &one):
		return matchUpstream(one.Message)
	}
	return ClassUnexpected, false
}

func matchUpstream(message string) (ErrorClass, bool) {
	message = strings.ToLower(message)
	for _, m := range upstreamMessages {
		if strings.Contains(message, m.substr) {
			return m.class, true
		}
	}
	return ClassUnexpected, false
}
