package error

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestErrInternal(t *testing.T) {
	werr := errors.New("wrapped")
	err := ErrInternalBy(werr)
	var err2 *ErrInternal
	assert.Equal(t, "internal", err.Error())
	assert.True(t, errors.As(err, &err2))
	assert.Same(t, werr, errors.Unwrap(err))
}

func TestError(t *testing.T) {
	werr := errors.New("wrapped")
	err := New("label", werr)
	var err2 *Error
	assert.Equal(t, "label: wrapped", err.Error())
	assert.True(t, errors.As(err, &err2))
	assert.Same(t, werr, errors.Unwrap(err))
	err3 := New("foo", err)
	assert.Equal(t, "foo.label: wrapped", err3.Error())
	err4 := New("bar", err3)
	assert.Equal(t, "bar.foo.label: wrapped", err4.Error())
}
