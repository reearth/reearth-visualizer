//go:generate go run go.uber.org/mock/mockgen@v0.6.0 -source=repo.go -destination=mockrepo/mockrepo.go -package=mockrepo -mock_names=Repo=MockUserRepo
package user

import (
	"context"
)

type Repo interface {
	FindMe(ctx context.Context) (*User, error)
	FindByID(ctx context.Context, id string) (*User, error)
}
