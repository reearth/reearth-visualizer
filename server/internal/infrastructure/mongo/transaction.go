package mongo

import (
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
)

type Transaction struct {
	client *mongodoc.Client
}

func NewTransaction(client *mongodoc.Client) repo.Transaction {
	return &Transaction{
		client: client,
	}
}

func (t *Transaction) Begin() (repo.Tx, error) {
	return t.client.BeginTransaction()
}
