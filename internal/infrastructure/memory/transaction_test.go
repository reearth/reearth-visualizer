package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTransaction_Committed(t *testing.T) {
	tr := NewTransaction()
	tx, err := tr.Begin()
	assert.NoError(t, err)
	assert.Equal(t, 0, tr.Committed())
	tx.Commit()
	assert.Equal(t, 1, tr.Committed())
	assert.NoError(t, tx.End(context.Background()))
	assert.NoError(t, err)
}

func TestTransaction_SetBeginError(t *testing.T) {
	err := errors.New("a")
	tr := NewTransaction()
	tr.SetBeginError(err)
	tx, err2 := tr.Begin()
	assert.Nil(t, tx)
	assert.Same(t, err, err2)
}

func TestTransaction_SetEndError(t *testing.T) {
	err := errors.New("a")
	tr := NewTransaction()
	tr.SetEndError(err)
	tx, err2 := tr.Begin()
	assert.NoError(t, err2)
	assert.Same(t, err, tx.End(context.Background()))
}
