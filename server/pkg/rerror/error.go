package rerror

import (
	"fmt"
	"runtime/debug"

	"github.com/pkg/errors"
	"github.com/reearth/reearth-backend/pkg/log"
)

var (
	errInternal = errors.New("internal")
	// ErrNotFound indicates something was not found.
	ErrNotFound = errors.New("not found")
	// ErrInvalidParams represents the params are invalid, such as empty string.
	ErrInvalidParams = errors.New("invalid params")
	// ErrNotImplemented indicates unimplemented.
	ErrNotImplemented = errors.New("not implemented")
)

func ErrInternalBy(err error) error {
	return errInternalBy(errInternal, err)
}

func ErrInternalByWith(label string, err error) error {
	return errInternalBy(errors.New(label), err)
}

func ErrInternalByWithError(label, err error) error {
	return errInternalBy(label, err)
}

func errInternalBy(label, err error) *Error {
	log.Errorf("%s: %s", label.Error(), err.Error())
	debug.PrintStack()
	return &Error{
		Label:  label,
		Err:    err,
		Hidden: true,
	}
}

func UnwrapErrInternal(err error) error {
	return As(err, errInternal)
}

// Error can hold an error together with label.
// This is useful for displaying a hierarchical error message cleanly and searching by label later to retrieve a wrapped error.
// Currently, Go standard error library does not support these use cases. That's why we need our own error type.
type Error struct {
	Label    error
	Err      error
	Hidden   bool
	Separate bool
}

// From creates an Error with string label.
func From(label string, err error) *Error {
	return &Error{Label: errors.New(label), Err: err}
}

// From creates an Error with string label, but separated from wrapped error message when the error is printed.
func FromSep(label string, err error) *Error {
	return &Error{Label: errors.New(label), Err: err, Separate: true}
}

// Error implements error interface.
func (e *Error) Error() string {
	if e == nil {
		return ""
	}
	if e.Hidden {
		return e.Label.Error()
	}
	if !e.Separate {
		if e2, ok := e.Err.(*Error); ok {
			return fmt.Sprintf("%s.%s", e.Label, e2)
		}
	}
	return fmt.Sprintf("%s: %s", e.Label, e.Err)
}

// Unwrap implements the interface for errors.Unwrap.
func (e *Error) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Err
}

// Get gets Error struct from an error
func Get(err error) *Error {
	var target *Error
	_ = errors.As(err, &target)
	return target
}

// Is looks up errors whose label is the same as the specific label and return true if it was found
func Is(err error, label error) bool {
	if err == nil {
		return false
	}
	e := err
	var target *Error
	for {
		if !errors.As(e, &target) {
			break
		}
		if target.Label == label {
			return true
		}
		e = target.Unwrap()
	}
	return false
}

// As looks up errors whose label is the same as the specific label and return a wrapped error.
func As(err error, label error) error {
	if err == nil {
		return nil
	}
	e := err
	for {
		target := Get(e)
		if target == nil {
			break
		}
		if target.Label == label {
			return target.Unwrap()
		}
		e = target.Unwrap()
	}
	return nil
}

// With returns a new constructor to generate an Error with specific label.
func With(label error) func(error) *Error {
	return func(err error) *Error {
		return &Error{
			Label:    label,
			Err:      err,
			Separate: true,
		}
	}
}
