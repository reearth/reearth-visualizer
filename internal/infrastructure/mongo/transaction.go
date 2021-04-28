package mongo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	s, err := t.client.Session()
	if err != nil {
		return nil, err1.ErrInternalBy(err)
	}

	if err := s.StartTransaction(&options.TransactionOptions{}); err != nil {
		return nil, err1.ErrInternalBy(err)
	}

	return &Tx{session: s, commit: false}, nil
}

type Tx struct {
	session mongo.Session
	commit  bool
}

func (t *Tx) Commit() {
	if t == nil {
		return
	}
	t.commit = true
}

func (t *Tx) End(ctx context.Context) error {
	if t == nil {
		return nil
	}

	if t.commit {
		if err := t.session.CommitTransaction(ctx); err != nil {
			return err1.ErrInternalBy(err)
		}
	} else if err := t.session.AbortTransaction(ctx); err != nil {
		return err1.ErrInternalBy(err)
	}

	t.session.EndSession(ctx)
	return nil
}
