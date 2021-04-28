package memory

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

type Transaction struct{}

type Tx struct{}

func NewTransaction() *Transaction {
	return &Transaction{}
}

func (t *Transaction) Begin() (repo.Tx, error) {
	return &Tx{}, nil
}

func (t *Tx) Commit() {
	// do nothing
}

func (t *Tx) End(_ context.Context) error {
	return nil
}
