package verror

import (
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

// VError represents an error with a code identifier.
type VError struct {
	Code string
	VErr *rerror.E
}

// NewVError creates a new VError with the given key and error.
func NewVError(key string, err error) *VError {
	rerr := rerror.WrapE(i18n.T(key), err)
	return &VError{
		Code: key,
		VErr: rerr,
	}
}

// Error returns the error message.
func (e *VError) Error() string {
	return e.VErr.Error()
}

// Unwrap returns the underlying error.
func (e *VError) Unwrap() error {
	return e.VErr
}
