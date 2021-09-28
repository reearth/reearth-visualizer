package rerror

import (
	"errors"
	"fmt"
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
	label := errors.New("label")
	var err error = &Error{Label: label, Err: werr}

	var err2 *Error
	assert.Equal(t, "label: wrapped", err.Error())
	assert.True(t, errors.As(err, &err2))
	assert.Same(t, werr, errors.Unwrap(err))

	label2 := errors.New("foo")
	err3 := &Error{Label: label2, Err: err}
	assert.Equal(t, "foo.label: wrapped", err3.Error())

	label3 := errors.New("bar")
	err4 := &Error{Label: label3, Err: err3}
	assert.Equal(t, "bar.foo.label: wrapped", err4.Error())

	err5 := Error{
		Label:  label,
		Err:    werr,
		Hidden: true,
	}
	assert.Equal(t, "label", err5.Error())

	var nilerr *Error
	assert.Equal(t, "", nilerr.Error())
	assert.Nil(t, nilerr.Unwrap())

	err6 := &Error{Label: errors.New("d"), Err: &Error{Label: errors.New("e"), Err: &Error{Label: errors.New("f"), Err: errors.New("g")}}, Separate: true}
	assert.Equal(t, "d: e.f: g", err6.Error())
}

func TestFrom(t *testing.T) {
	werr := errors.New("wrapped")
	err := From("label", werr)
	assert.Equal(t, "label", err.Label.Error())
	assert.Same(t, werr, err.Err)
	assert.False(t, err.Hidden)
}

func TestFromSep(t *testing.T) {
	werr := &Error{Label: errors.New("wrapped"), Err: errors.New("wrapped2")}
	err := FromSep("label", werr)
	assert.Equal(t, "label", err.Label.Error())
	assert.Same(t, werr, err.Err)
	assert.False(t, err.Hidden)
	assert.True(t, err.Separate)
}

func TestGet(t *testing.T) {
	werr := &Error{Label: errors.New("hoge"), Err: errors.New("wrapped")}
	err := fmt.Errorf("wrapped: %w", werr)
	assert.Same(t, werr, Get(err))
	assert.Same(t, werr, Get(werr))
}

func TestIs(t *testing.T) {
	werr := errors.New("wrapped")
	label := errors.New("label")
	err := &Error{
		Label: label,
		Err:   werr,
	}
	assert.True(t, Is(err, label))
	assert.False(t, Is(err, errors.New("label")))
	assert.False(t, Is(err, errors.New("nested")))
	assert.False(t, Is(err, errors.New("wrapped")))

	label2 := errors.New("nested")
	err = &Error{
		Label: label2,
		Err: &Error{
			Label: label,
			Err:   werr,
		},
	}
	assert.True(t, Is(err, label))
	assert.True(t, Is(err, label2))
	assert.False(t, Is(err, errors.New("label")))
	assert.False(t, Is(err, errors.New("nested")))
	assert.False(t, Is(err, errors.New("wrapped")))
	assert.False(t, Is(nil, errors.New("label")))
}

func TestAs(t *testing.T) {
	werr := errors.New("wrapped")
	label := errors.New("label")
	err := &Error{
		Label: label,
		Err:   werr,
	}
	assert.Same(t, werr, As(err, label))
	assert.Nil(t, As(err, errors.New("label")))
	assert.Nil(t, As(err, errors.New("nested")))
	assert.Nil(t, As(err, errors.New("wrapped")))

	label2 := errors.New("nested")
	err = &Error{
		Label: label2,
		Err: &Error{
			Label: label,
			Err:   werr,
		},
	}
	assert.Same(t, werr, As(err, label))
	assert.Same(t, err.Err, As(err, label2))
	assert.Nil(t, As(err, errors.New("label")))
	assert.Nil(t, As(err, errors.New("nested")))
	assert.Nil(t, As(err, errors.New("wrapped")))

	assert.Nil(t, As(nil, errors.New("label")))
}

func TestWith(t *testing.T) {
	werr := errors.New("wrapped")
	label := errors.New("label")
	err := With(label)(werr)
	assert.Equal(t, &Error{
		Label:    label,
		Err:      werr,
		Separate: true,
	}, err)
	assert.Same(t, label, err.Label)
	assert.Same(t, werr, err.Err)

	err = With(label)(nil)
	assert.Equal(t, &Error{
		Label:    label,
		Err:      nil,
		Separate: true,
	}, err)
	assert.Same(t, label, err.Label)
	assert.Nil(t, err.Err)
}
