package factory

import (
	"github.com/go-faker/faker/v4"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
)

type UserOption func(*accountsUser.Builder)

func NewUser(opts ...UserOption) *accountsUser.User {
	p := accountsUser.New().
		ID(accountsID.NewUserID()).
		Name(faker.Name()).
		Email(faker.Email())
	for _, opt := range opts {
		opt(p)
	}
	return p.MustBuild()
}
