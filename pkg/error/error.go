package error

import (
	"fmt"

	"github.com/pkg/errors"
)

var (
	// ErrNotFound _
	ErrNotFound = errors.New("not found")
	// ErrInvalidParams represents the params are invalid, such as empty string.
	ErrInvalidParams = errors.New("invalid params")
	// ErrNotImplemented _
	ErrNotImplemented = errors.New("not implemented")
	// ErrUserNotFound _
	ErrUserNotFound = errors.New("user is not found")
)

// ErrInternal is an error struct that can hold an internal error but hides users the details.
type ErrInternal struct {
	Err error
}

func ErrInternalBy(err error) error {
	return &ErrInternal{
		Err: err,
	}
}

func (e *ErrInternal) Error() string {
	if e == nil {
		return ""
	}
	return "internal"
}

func (e *ErrInternal) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Err
}

// Error can hold an error together with any label. This is useful for displaying a hierarchical error.
type Error struct {
	Label string
	Err   error
}

func New(label string, err error) *Error {
	return &Error{
		Label: label,
		Err:   err,
	}
}

func (e *Error) Error() string {
	if e == nil {
		return ""
	}
	if e2, ok := e.Err.(*Error); ok {
		return fmt.Sprintf("%s.%s", e.Label, e2)
	}
	return fmt.Sprintf("%s: %s", e.Label, e.Err)
}

func (e *Error) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Err
}
