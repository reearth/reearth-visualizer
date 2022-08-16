package memory

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

type Transaction struct {
	committed  int
	beginerror error
	enderror   error
}

type Tx struct {
	t         *Transaction
	committed bool
	enderror  error
}

func NewTransaction() *Transaction {
	return &Transaction{}
}

func (t *Transaction) SetBeginError(err error) {
	t.beginerror = err
}

func (t *Transaction) SetEndError(err error) {
	t.enderror = err
}

func (t *Transaction) Committed() int {
	return t.committed
}

func (t *Transaction) Begin() (repo.Tx, error) {
	if t.beginerror != nil {
		return nil, t.beginerror
	}
	return &Tx{t: t, enderror: t.enderror}, nil
}

func (t *Tx) Commit() {
	t.committed = true
}

func (t *Tx) End(_ context.Context) error {
	if t.enderror != nil {
		return t.enderror
	}
	if t.t != nil && t.committed {
		t.t.committed++
	}
	return nil
}

func (t *Tx) IsCommitted() bool {
	return t.committed
}
